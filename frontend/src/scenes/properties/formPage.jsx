import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, useTheme } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { Formik } from "formik";
import { tokens } from "../../theme";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage';


const PropertiesForm = () => {
  const token = secureLocalStorage.getItem('auth_token');
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = secureLocalStorage.getItem('userData'); 
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  },[]);  

  const navigate = useNavigate(); 

  const handleFormSubmit = async (values) => {
  try {
    console.log(userData.email);
    // Realizar a requisição POST para o backend usando axios
    const response = await axios.post("http://localhost:3000/properties", {
      name: values.namePropertie,
      area: values.area,          
      city: values.city,          
      email: userData.email
      },{
        headers: {Authorization: `Bearer ${token}`}
      });

    if (response.status === 201) {
      //console.log("Propriedade criada com sucesso:", response.data);

      navigate(`/propriedades?message=${encodeURIComponent("1")}`);
    }
  } catch (error) {
    if (error.response?.status === 401) {
      alert('Sessão expirada. Faça login novamente.');
      secureLocalStorage.removeItem('userData');
      secureLocalStorage.removeItem('auth_token');
      window.location.href = '/login';
    } else {
    console.error("Erro ao criar propriedade:", error);
    }
  }
};

  return (
    <Box m="20px">
      <Header title="Adicionar Propriedade" subtitle="Preencha os campos para que seja cadastrado uma propriedade" />

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
                label="Nome da Propriedade"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.namePropertie}
                name="namePropertie"
                error={!!touched.namePropertie && !!errors.namePropertie}
                helperText={touched.namePropertie && errors.namePropertie}
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
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Cidade"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.city}
                name="city"
                error={!!touched.city && !!errors.city}
                helperText={touched.city && errors.city}
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
    namePropertie: yup.string().required("Campo de preenchimento obrigatório"),
    area: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    city: yup.string().required("Campo de preenchimento obrigatório"),

});
const initialValues = {
    namePropertie: "",
    area: "",
    city: "",
};

export default PropertiesForm;