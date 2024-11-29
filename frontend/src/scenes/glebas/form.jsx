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
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); 
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
              params: { email: userData.email }
            });
            const propertyData = response.data.map(property =>({
                id: property.id,
                name: property.name
            }));
            setPropertyOptions(propertyData);

            if(id){
              const fetchPropertyData = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/propriedades/${id}`);
                    setProperty(response.data.property);
                    setLoading(false); 
                } catch (error) {
                    console.error("Erro ao buscar dados da gleba:", error);
                    setLoading(false); 
                }
            };
            fetchPropertyData();
            }

        } catch (err) {
            console.error('Erro ao buscar propriedades:', err);  
        }finally {
          setLoading(false);
        }
      };
      fetchPropriedades();
    }
  }, [userData,id]);

  const initialValues = {
    nameGleba: "",
    area: "",
    property: property? property.name :""   
  }

  const navigate = useNavigate(); 
  const handleFormSubmit = async (values) => {
    //console.log("Valores do formulário:", values);
    if(id){
      values.property = property.id
    }
    try {
      const response = await axios.post("http://localhost:3000/glebas", {
        name: values.nameGleba,
        propertyId: values.property,          
        area: values.area,          
        email: userData.email
      });
  
      if (response.status === 201) {
        //console.log("Gleba criada com sucesso:", response.data);
  
        navigate(`/glebas?message=${encodeURIComponent("1")}`);
      }
    } catch (error) {
      console.error("Erro ao criar gleba: " , error);
    }
  };

  if (loading) {
    return <Typography variant="h4" fontWeight="bold" sx={{ml: "50px"}}>Carregando...</Typography>;
  }
  
  return (
    <Box m="20px">
      <Header title="Adicionar Gleba" subtitle="Preencha os campos para que seja cadastrado uma gleba" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={id ? checkoutSchema2 : checkoutSchema}
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
                label="Nome da Gleba"
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
                  label="Área"
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

const checkoutSchema2 = yup.object().shape({
  nameGleba: yup.string().required("Campo de preenchimento obrigatório"),
  area: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
});
export default GlebasForm;
