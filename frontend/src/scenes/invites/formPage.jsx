import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, useTheme, Autocomplete, useMediaQuery } from "@mui/material";
import { useNavigate, useParams } from 'react-router-dom';
import { Formik } from "formik";
import { tokens } from "../../theme";
import * as yup from "yup";
import Header from "../../components/Header";
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage'; 

const InvitesForm = () => {
  const token = secureLocalStorage.getItem('auth_token');
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); 
  const [property, setProperty] = useState(null);
  const [errorMessage, setErrorMessage] = useState(""); // Novo estado para a mensagem de erro

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
          const response = await axios.get(`http://localhost:3000/properties-invites`, {
            headers: {Authorization: `Bearer ${token}`}
          });
          const properties = response.data;
          setPropertyOptions(properties);

          if(id){
            const property = properties.filter(property => property.id === Number(id));
            setProperty(property[0]);
          }

        } catch (error) {
          if (error.response?.status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            secureLocalStorage.removeItem('userData');
            secureLocalStorage.removeItem('auth_token');
            window.location.href = '/login';
          } else {
            console.error('Erro ao buscar propriedades:', err);             
          }
        } finally {
          setLoading(false);
        }
      };
      fetchPropriedades();
    }
  }, [userData, id]);

  const initialValues = {
    email: "",
    property:  property ? property.id : ""  
  };

  const navigate = useNavigate(); 
  const handleFormSubmit = async (values) => {
    setErrorMessage(""); 

    if (id) {
      values.property = property.id;
    }

    try {
      const response = await axios.post("http://localhost:3000/invites", {
        reciverEmail: values.email,
        propertyId: values.property,
        senderEmail: userData.email
      },
      {
        headers: {Authorization: `Bearer ${token}`}
      });
  
      if (response.status === 201) {
        navigate(`/convites?message=${encodeURIComponent("1")}`);
      } else if (response.status === 200) {
        navigate(`/convites?message=${encodeURIComponent("2")}`);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        secureLocalStorage.removeItem('userData');
        secureLocalStorage.removeItem('auth_token');
        window.location.href = '/login';
      } else if (error.response && error.response.status === 400) {
        setErrorMessage(error.response.data.error || "Erro ao criar o convite.");
      } else {
        console.error("Erro ao criar invite:", error);
      }
    }
  };

  if (loading) {
    return <Typography variant="h4" fontWeight="bold" sx={{ml: "50px"}}>Carregando...</Typography>;
  }
  
  return (
    <Box m="20px">
      <Header title="Enviar Convite" subtitle="Preencha os campos para que seja enviado o convite para a sua propriedade" />

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
                type="email"
                label="E-mail do Destinatário"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 2" }}
              />
              {property ? (
                <TextField
                  fullWidth
                  variant="filled"
                  label="Propriedade"
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

            {/* Exibir a mensagem de erro abaixo do campo de email */}
            {errorMessage && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {errorMessage}
              </Typography>
            )}

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
                Enviar
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  email: yup
      .string()
      .email("Formato de email inválido") 
      .required("Campo de preenchimento obrigatório"), 
  property: yup.string().required("Campo de preenchimento obrigatório"),
});

const checkoutSchema2 = yup.object().shape({
  email: yup
      .string()
      .email("Formato de email inválido") 
      .required("Campo de preenchimento obrigatório"), 
});

export default InvitesForm;
