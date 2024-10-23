import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography,useMediaQuery, useTheme,Autocomplete } from "@mui/material";
import { useNavigate,useParams } from 'react-router-dom';
import { Formik } from "formik";
import { tokens } from "../../theme";
import * as yup from "yup";
import Header from "../../components/Header";
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage';


const GlebasEditForm = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [optionsPropertie, setOptionsPropertie] = useState([]);
  const [optionsPropertieId, setOptionsPropertieId] = useState([]);
  const [userData, setUserData] = useState(null);
  const [property, setProperty] = useState("");
  const [gleba, setGleba] = useState("");
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); 


  useEffect(() => {
    const storedUser = secureLocalStorage.getItem('userData'); 
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  },[]);  

  useEffect(() => {
    if (userData && userData.email) {
        const fetchPropertyData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/gleba/${id}`);
                const { gleba, property, owner } = response.data;
                setGleba(gleba);
                setProperty(property);
                setLoading(false); 
            } catch (error) {
                console.error("Erro ao buscar dados da gleba:", error);
                setLoading(false); 
            }
        };
        fetchPropertyData();
    }
}, [userData, id]);

  const initialValues = {
    nameGleba: gleba? gleba.name : "",
    area: gleba ? gleba.area : "",
    propertie: property? property.name :"" 
  }

  console.log(initialValues)

  const navigate = useNavigate(); 
  const handleFormSubmit = async (values) => {
    try {
      const response = await axios.put(`http://localhost:3000/editGleba/${id}`, {
        name: values.nameGleba,
        area: values.area,          
        email: userData.email
      });
  
      if (response.status === 200) {
        //console.log("Gleba editada com sucesso:", response.data);
  
        navigate(`/glebas?message=${encodeURIComponent("2")}`);
      }
    } catch (error) {
      console.error("Erro ao editar gleba: " , error);
    }
  };

  if (loading) {
    return <Typography variant="h4" fontWeight="bold" sx={{ml: "50px"}}>Carregando...</Typography>;
  }
  
  return (
    <Box m="20px">
      <Header title="Editar Gleba" subtitle="Edite os campos da gleba" />

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
                  type="text"
                  label="Área"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.area}
                  name="area"
                  error={!!touched.area && !!errors.area}
                  helperText={touched.area && errors.area}
                  sx={{ gridColumn: "span 2" }}
                />
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Propriedade"
                    value={property.name}
                    disabled 
                    sx={{ gridColumn: "span 2" }}
                  />
            
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
                Editar
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
    area: yup.string().required("Campo de preenchimento obrigatório"),
});
export default GlebasEditForm;
