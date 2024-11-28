import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, useTheme, Autocomplete, useMediaQuery } from "@mui/material";
import { useNavigate,useParams } from 'react-router-dom';
import { Formik } from "formik";
import { tokens } from "../../theme";
import * as yup from "yup";
import Header from "../../components/Header";
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage'; 


const SafrasForm = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [gleba,setGleba] = useState(null);
  const [optionsGleba, setOptionsGleba] = useState([]);
  const [optionsGlebaId, setOptionsGlebaId] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); 


  const fields = [
    { name: "cultivo", label: "Cultivo", type: "text" },
    { name: "semente", label: "Semente", type: "text" },
    { name: "metroLinear", label: "Metro Linear", type: "number" },
    { name: "dosagem", label: "Dosagem (kg/ha)", type: "number" },
    { name: "toneladas", label: "Toneladas", type: "number" },
    { name: "adubo", label: "Adubo", type: "text" },
    { name: "dataFimPlantio", label: "Data Fim Plantio", type: "date" },
    { name: "dataFimColheita", label: "Data Fim Colheita", type: "date" },
    { name: "tempoLavoura", label: "Tempo de Lavoura (dias)", type: "number", disabled: true },
    { name: "prodTotal", label: "Prod. Total", type: "number" },
    { name: "prodPrevista", label: "Prod. Prevista", type: "number" },
    
    
  ];
  
  useEffect(() => {
    const storedUser = secureLocalStorage.getItem('userData'); 
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  },[]);  

  useEffect(() => {
    if (userData && userData.email) {
      const fetchSafras = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/searchGlebas/${userData.email}`);
            const glebaNames = response.data
                .flatMap(property =>
                    property.glebas.map(gleba => `${gleba.name} - ${property.name}`) // Concatena o nome da gleba com o nome da fazenda
                );
            setOptionsGleba(glebaNames);    
            console.log(optionsGleba);

            //console.log(optionsGleba); 
            const glebaIds = response.data.flatMap(property =>
              property.glebas.map(gleba => ({
                id: gleba.id,
                name: gleba.name
              }))
            );
            setOptionsGlebaId(glebaIds);
            console.log(optionsGlebaId)

            if(id){
              const fetchSafraData = async () => {
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
            fetchSafraData();
            }

        } catch (err) {
            console.error('Erro ao buscar safras:', err);  
        }finally {
          setLoading(false);
        }
      };
      fetchSafras();
    }
  }, [userData]);

  const calculateTempoLavoura = (dataFimPlantio, dataFimColheita) => {
    if (dataFimPlantio && dataFimColheita) {
      const diff = new Date(dataFimColheita) - new Date(dataFimPlantio);
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    return "";
  };

  const initialValues = {
    cultivo: "",
    semente: "",
    metroLinear: "",
    dosagem: "",
    toneladas: "",
    adubo: "",
    dataFimPlantio: "",
    dataFimColheita: "",
    tempoLavoura: "",
    prodTotal: "",
    prodPrevista: "",
    nameGleba: "",
  };  

  const navigate = useNavigate(); 
  const handleFormSubmit = async (values) => {
    try {
      const extractedValue = values.nameGleba.split(" - ")[0];
      console.log(extractedValue)
      const index = optionsGlebaId.findIndex(item => item.name === extractedValue);

      if (index === -1) {
        console.error("Gleba não encontrada ao procurar na Safra");
        return; 
      }
      const glebaId = optionsGlebaId[index].id;

      const response = await axios.post("http://localhost:3000/safras", {
        email: userData.email,
        glebaId: glebaId,
        cultivo: values.cultivo, 
        semente: values.semente,
        metroLinear: values.metroLinear,
        dosagem: values.dosagem,
        toneladas: values.toneladas,
        adubo: values.adubo,
        dataFimPlantio: values.dataFimPlantio,
        dataFimColheita: values.dataFimColheita,
        tempoLavoura: values.tempoLavoura,
        prodTotal: values.prodTotal,
        prodPrevista: values.prodPrevista,
      });
      if (response.status === 201) {  
        navigate(`/safras?message=${encodeURIComponent("1")}`);
      }
      
    } catch (error) {
      console.error("Erro ao criar safra: " , error);
    }
  };

  if (loading) {
    return <Typography variant="h4" fontWeight="bold" sx={{ml: "50px"}}>Carregando...</Typography>;
  }
  
  return (
    <Box m="20px">
      <Header title="Adicionar Safra" subtitle="Preencha os campos para que seja cadastrado uma safra" />
      <Typography variant="body1" sx={{ mb: "20px", color: colors.grey[600] }}>
        Toda safra criada inicialmente possui o status de <i>Planejada</i>.
      </Typography>
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
                {gleba ? (
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Gleba"
                    value={gleba.name}
                    disabled 
                    sx={{ gridColumn: "span 2" }}
                    
                  />
                ) : (
                  <Autocomplete
                    disablePortal
                    id="glebas"
                    options={optionsGleba}
                    name="nameGleba"
                    value={values.nameGleba || null} 
                    onChange={(event, value) => setFieldValue('nameGleba', value)} 
                    onBlur={handleBlur} 
                    sx={{ gridColumn: "span 2" }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Gleba"
                        variant="filled"
                        name="nameGleba"
                        error={!!touched.nameGleba && !!errors.nameGleba}
                        helperText={touched.nameGleba && errors.nameGleba}
                        onBlur={handleBlur} 
                      />
                    )}
                    noOptionsText="Não Encontrado"
                  />
                )}

                {fields.map(({ name, label, type, disabled }) => (
                  <TextField
                    key={name}
                    fullWidth
                    variant="filled"
                    type={type}
                    label={label}
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      if (name === "dataFimPlantio" || name === "dataFimColheita") {
                        const tempoLavoura = calculateTempoLavoura(
                          name === "dataFimPlantio" ? e.target.value : values.dataFimPlantio,
                          name === "dataFimColheita" ? e.target.value : values.dataFimColheita
                        );
                        setFieldValue("tempoLavoura", tempoLavoura);
                      }
                    }}
                    value={values[name] || ""}
                    name={name}
                    disabled={disabled}
                    error={touched[name] && Boolean(errors[name])}
                    helperText={touched[name] && errors[name]}
                    sx={{ gridColumn: "span 1" }}
                    InputLabelProps={type === "date" ? { shrink: true } : {}}
                  />
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
                Adicionar
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
    cultivo: yup.string().required("Campo de preenchimento obrigatório"),
    semente: yup.string().required("Campo de preenchimento obrigatório"),
    metroLinear: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    dosagem: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    toneladas: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    adubo: yup.string().required("Campo de preenchimento obrigatório"),
    dataFimPlantio: yup.date().required("Campo de preenchimento obrigatório").typeError("Deve ser uma data válida"),
    dataFimColheita: yup.date().required("Campo de preenchimento obrigatório").typeError("Deve ser uma data válida"),
    //tempoLavoura: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    prodTotal: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    prodPrevista: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
    nameGleba: yup.string().required("Campo de preenchimento obrigatório"),
});
export default SafrasForm;
