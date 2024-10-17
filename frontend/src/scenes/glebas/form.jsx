import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, useTheme } from "@mui/material";
import { useNavigate,useParams } from 'react-router-dom';
import { Formik } from "formik";
import { tokens } from "../../theme";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage';
import Autocomplete from '@mui/material/Autocomplete';


const GlebasForm = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [optionsPropertie, setOptionsPropertie] = useState([]);
  const [optionsPropertieId, setOptionsPropertieId] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); 
  const [propertie,setPropertie] = useState(null)


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
            const response = await axios.get(`http://localhost:3000/${userData.email}/propriedades`);
            const propriedades = response.data.map(propriedade => propriedade.name);
            const propriedadesId = response.data.map(propriedade => ({
              id: propriedade.id,
              name: propriedade.name,
            }));
            setOptionsPropertieId(propriedadesId);
            setOptionsPropertie(propriedades);

            if(id){
              const fetchPropertyData = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/gleba/${id}`);
                    const { gleba, propriedade, owner } = response.data;
                    setPropertie(propriedade);
                    //console.log("info --> " + propriedade.name + " " + gleba.name )
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
  }, [userData]);

  const initialValues = {
    nameGleba: "",
    area: "",
    propertie: propertie? propertie.name :"" 
  }

  

  const navigate = useNavigate(); 
  const handleFormSubmit = async (values) => {
    try {
      const index = optionsPropertieId.findIndex(item => item.name === values.propertie);

      if (index === -1) {
        console.error("Propriedade não encontrada ao procurar na Gleba");
        return; 
      }

      // Agora você pode usar o índice para acessar o vetor X
      const propriedadeId = optionsPropertieId[index].id;

      // Realizar a requisição POST para o backend usando axios
      const response = await axios.post("http://localhost:3000/createGleba", {
        name: values.nameGleba,
        propertieId: propriedadeId,          
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
      <Header title="Adicionar Gleba" subtitle="Preencha os campos para que seja criado a gleba" />

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
                {propertie ? (
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Propriedades"
                    value={propertie.name}
                    disabled 
                    sx={{ gridColumn: "span 2" }}
                    
                  />
                ) : (
                  <Autocomplete
                    disablePortal
                    id="properties"
                    options={optionsPropertie}
                    name="propertie"
                    value={values.propertie || null} 
                    onChange={(event, value) => setFieldValue('propertie', value)} 
                    onBlur={handleBlur} 
                    sx={{ gridColumn: "span 2" }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Propriedades"
                        variant="filled"
                        name="propertie"
                        error={!!touched.propertie && !!errors.propertie }
                        helperText={touched.propertie &&  errors.propertie }
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
    area: yup.string().required("Campo de preenchimento obrigatório"),
    propertie: yup.string().required("Campo de preenchimento obrigatório"),

});
export default GlebasForm;
