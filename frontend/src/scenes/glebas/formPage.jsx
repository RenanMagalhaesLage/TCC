import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, useTheme, Autocomplete, useMediaQuery } from "@mui/material";
import { useNavigate,useParams } from 'react-router-dom';
import { Formik } from "formik";
import { tokens } from "../../theme";
import * as yup from "yup";
import Header from "../../components/Header";
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage'; 


const GlebasForm = () => {
  const token = secureLocalStorage.getItem('auth_token');
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [property,setProperty] = useState(null);


  useEffect(() => {
    const storedUser = secureLocalStorage.getItem('userData'); 
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  },[]);  

  useEffect(() => {
    if (userData && userData.email) {
      const fetchPropriedades = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/user`, {
            headers: {Authorization: `Bearer ${token}`}
          });
          const propertyData = response.data.map(property =>({
              id: property.id,
              name: property.name
          }));
          setPropertyOptions(propertyData);
        } catch (error) {
          if (error.response?.status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            secureLocalStorage.removeItem('userData');
            secureLocalStorage.removeItem('auth_token');
            window.location.href = '/login';
          } else {
            console.log("ERRO - ao buscar as propriedades." + error);
          } 
        }finally {
          setLoading(false);
        }
      };
      fetchPropriedades();
    }
  }, [userData]);

  const initialValues = {
    nameGleba: "",
    area: "",
    property: property? property.name :""   
  }

  const navigate = useNavigate(); 
  const handleFormSubmit = async (values) => {
    console.log("Valores do formulário:", values);
    try {
      const response = await axios.post("http://localhost:3000/glebas", {
        name: values.nameGleba,
        propertyId: values.property,          
        area: values.area,          
        email: userData.email
      },{
        headers: {Authorization: `Bearer ${token}`}
      }
      );
  
      if (response.status === 201) {
        //console.log("Gleba criada com sucesso:", response.data);
  
        navigate(`/talhoes?message=${encodeURIComponent("1")}`);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        secureLocalStorage.removeItem('userData');
        secureLocalStorage.removeItem('auth_token');
        window.location.href = '/login';
      } else {
        console.error("Erro ao criar talhão: " , error);
      }
      
    }
  };

  if (loading) {
    return <Typography variant="h4" fontWeight="bold" sx={{ml: "50px"}}>Carregando...</Typography>;
  }
  
  return (
    <Box m="20px">
      <Header title="Adicionar Talhão" subtitle="Preencha os campos para que seja cadastrado um talhão" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Nome do Talhão"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nameGleba}
                name="nameGleba"
                error={!!touched.nameGleba && !!errors.nameGleba}
                helperText={touched.nameGleba && errors.nameGleba}
                sx={{ gridColumn: "span 4" }}
              />
                <TextField
                  fullWidth
                  variant="filled"
                  type="number"
                  label="Área em Hectares"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.area}
                  name="area"
                  error={!!touched.area && !!errors.area}
                  helperText={touched.area && errors.area}
                  sx={{ gridColumn: "span 2" }}
                />
                {property ?(
                  <TextField
                    id="properties"
                    fullWidth
                    variant="filled"
                    label="Propriedade"
                    name="property"
                    value={property.name}
                    disabled 
                    sx={{ gridColumn: "span 2" }}
                    
                  />
                ) : (
                  <Autocomplete
                    disablePortal
                    id="properties"
                    options={propertyOptions}
                    getOptionLabel={(option) => option.name || ""}
                    name="property"

                    value={
                      values.property
                        ? propertyOptions.find((option) => option.id === values.property) 
                        : null
                    } 
                    onChange={(event, value) => setFieldValue('property', value?.id || null)} 
                    onBlur={handleBlur} 
                    sx={{ gridColumn: "span 2" }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Propriedade"
                        variant="filled"
                        name="property"
                        error={!!touched.property && !!errors.property }
                        helperText={touched.property &&  errors.property }
                        onBlur={handleBlur} 
                      />
                    )}
                    noOptionsText="Não Encontrado"
                  />
                )}
            
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button 
                    type="submit"
                    sx={{ 
                        backgroundColor: colors.mygreen[400],
                        color: colors.grey[100],
                        fontSize: "12px",
                        fontWeight: "bold",
                        "&:hover": {
                          backgroundColor: colors.grey[700], 
                        },
                    }} 
                    variant="contained">
                Adicionar
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};


const checkoutSchema = yup.object().shape({
    nameGleba: yup.string().required("Campo de preenchimento obrigatório"),
    area: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    property: yup.string().required("Campo de preenchimento obrigatório"),
});

export default GlebasForm;
