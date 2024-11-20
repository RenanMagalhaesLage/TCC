import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, useTheme, Autocomplete, useMediaQuery } from "@mui/material";
import { useNavigate,useParams } from 'react-router-dom';
import { Formik } from "formik";
import { tokens } from "../../theme";
import * as yup from "yup";
import Header from "../../components/Header";
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage'; 


const SafrasEditForm = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [propertie,setPropertie] = useState(null);
  const [gleba,setGleba] = useState(null);
  const [safra, setSafra] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); 


  const fields = [
    { name: "type", label: "Tipo", type: "text" },
    { name: "cultivo", label: "Cultivo", type: "text" },
    { name: "semente", label: "Semente", type: "text" },
    { name: "metroLinear", label: "Metro Linear", type: "text" },
    { name: "dosagem", label: "Dosagem (kg/ha)", type: "number" },
    { name: "toneladas", label: "Toneladas", type: "number" },
    { name: "adubo", label: "Adubo", type: "text" },
    { name: "dataFimPlantio", label: "Data Fim Plantio", type: "date" },
    { name: "dataFimColheita", label: "Data Fim Colheita", type: "date" },
    { name: "tempoLavoura", label: "Tempo Lavoura (dias)", type: "number" },
    { name: "precMilimetrica", label: "Precipitação Milimétrica", type: "number" },
    { name: "umidade", label: "Umidade", type: "number" },
    { name: "impureza", label: "Impureza", type: "number" },
    { name: "graosAvariados", label: "Grãos Avariados", type: "number" },
    { name: "graosEsverdeados", label: "Grãos Esverdeados", type: "number" },
    { name: "graosQuebrados", label: "Grãos Quebrados", type: "number" },
    { name: "prodTotal", label: "Prod. Total", type: "number" },
    { name: "prodPrevista", label: "Prod. Prevista", type: "number" },
    { name: "prodRealizada", label: "Prod. Realizada", type: "number" },
    { name: "porcentHect", label: "Porcentagem / HA", type: "number" },
  ];
  
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
                const response = await axios.get(`http://localhost:3000/safra/${id}`);
                const { safra, gleba, propriedade, owner } = response.data;
                setPropertie(propriedade);
                setGleba(gleba);
                setSafra(safra)
                setLoading(false); 
            } catch (error) {
                console.error("Erro ao buscar dados da safra:", error);
                setLoading(false); 
            }
        };
        fetchPropertyData();
    }
  }, [userData]);

    const initialValues = {
        type: safra ? safra.type :"",
        cultivo: safra ? safra.cultivo : "",
        semente: safra ? safra.semente :"",
        metroLinear: safra ? safra.metroLinear :"",
        dosagem: safra ? safra.dosagem :"",
        toneladas: safra ? safra.toneladas :"",
        adubo: safra ? safra.adubo :"",
        dataFimPlantio: safra ? safra.dataFimPlantio :"",
        dataFimColheita: safra ? safra.dataFimColheita :"",
        tempoLavoura: safra ? safra.tempoLavoura :"",
        precMilimetrica: safra ? safra.precMilimetrica :"",
        umidade: safra ? safra.umidade :"",
        impureza: safra ? safra.impureza :"",
        graosAvariados: safra ? safra.graosAvariados :"",
        graosEsverdeados: safra ? safra.graosEsverdeados :"",
        graosQuebrados: safra ? safra.graosQuebrados :"",
        prodTotal: safra ? safra.prodTotal :"",
        prodPrevista: safra ? safra.prodPrevista :"",
        prodRealizada: safra ? safra.prodRealizada :"",
        porcentHect: safra ? safra.porcentHect :"",
        nameGleba: gleba? gleba.name : "",
        propertie: propertie ? propertie.name : "",
    };

  

  const navigate = useNavigate(); 
  const handleFormSubmit = async (values) => {
    console.log("mandou")
  };

  if (loading) {
    return <Typography variant="h4" fontWeight="bold" sx={{ml: "50px"}}>Carregando...</Typography>;
  }
  
  return (
    <Box m="20px">
      <Header title="Adicionar Safra" subtitle="Preencha os campos para que seja criado a safra" />

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
                    label="Propriedade"
                    value={propertie.name}
                    disabled 
                    sx={{ gridColumn: "span 2" }}
                />
                <TextField
                    fullWidth
                    variant="filled"
                    label="Gleba"
                    value={gleba.name}
                    disabled 
                    sx={{ gridColumn: "span 2" }}
                />

               {fields.map(({ name, label, type }) => (
                    <React.Fragment key={name}> 
                        {
                          name === "type" ? (
                            <Autocomplete
                              disablePortal
                              id="types"
                              options={["Planejado", "Realizado"]}
                              name="type"
                              value={values.type || null}
                              onChange={(event, value) => {
                                setFieldValue('type', value);
                              }}
                              onBlur={handleBlur}
                              sx={{ gridColumn: "span 1" }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Tipo"
                                  variant="filled"
                                  error={!!touched.type && !!errors.type}
                                  helperText={touched.type && errors.type}
                                  onBlur={handleBlur}
                                />
                              )}
                              noOptionsText="Não Encontrado"
                            />
                          ) : type === "date" ? (
                            // Condicional para campos de tipo número
                            <TextField
                              fullWidth
                              variant="filled"
                              type={type}
                              label={label}
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values[name] || ''} 
                              name={name}
                              error={touched[name] && Boolean(errors[name])}
                              helperText={touched[name] && errors[name]}
                              sx={{ gridColumn: "span 1" }}
                              InputLabelProps={{
                                shrink:  true ,
                              }}
                            />
                          ) : (
                            // Condicional para outros tipos de input
                            <TextField
                              fullWidth
                              variant="filled"
                              type={type}
                              label={label}
                              onBlur={handleBlur}
                              onChange={handleChange}
                              value={values[name] || ''} 
                              name={name}
                              error={touched[name] && Boolean(errors[name])} 
                              helperText={touched[name] && errors[name]} 
                              sx={{ gridColumn: "span 1" }}
                              
                            />
                          )
                        }
                    </React.Fragment>
                ))}           
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
                Salvar
              </Button>
            </Box>
            {/*Object.keys(errors).length > 0 && (
                <Typography color="error" sx={{ mt: 2 }}>
                Por favor, corrija os erros acima.
                </Typography>
            )*/}
          </form>
        )}
      </Formik>
    </Box>
  );
};


const checkoutSchema = yup.object().shape({
    type: yup.string().required("Campo de preenchimento obrigatório"),
    cultivo: yup.string().required("Campo de preenchimento obrigatório"),
    semente: yup.string().required("Campo de preenchimento obrigatório"),
    metroLinear: yup.string().required("Campo de preenchimento obrigatório"),
    dosagem: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    toneladas: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    adubo: yup.string().required("Campo de preenchimento obrigatório"),
    dataFimPlantio: yup.date().required("Campo de preenchimento obrigatório").typeError("Deve ser uma data válida"),
    dataFimColheita: yup.date().required("Campo de preenchimento obrigatório").typeError("Deve ser uma data válida"),
    tempoLavoura: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    precMilimetrica: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    umidade: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    impureza: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    graosAvariados: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    graosEsverdeados: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    graosQuebrados: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    prodTotal: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    prodPrevista: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    prodRealizada: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    porcentHect: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    nameGleba: yup.string().required("Campo de preenchimento obrigatório"),
    propertie: yup.string().required("Campo de preenchimento obrigatório"),
});
export default SafrasEditForm;
