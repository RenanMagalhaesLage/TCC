import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, useTheme, Autocomplete, useMediaQuery, MenuItem } from "@mui/material";
import { useNavigate,useParams } from 'react-router-dom';
import { Formik } from "formik";
import { tokens } from "../../theme";
import * as yup from "yup";
import Header from "../../components/Header";
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage'; 


const SafrasEditPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [property, setProperty] = useState("");
  const [gleba, setGleba] = useState("");
  const [safra, setSafra] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); 
  const [isPlanejado, setIsPlanejado] = useState(true);


  const fields = [
    //{ name: "type", label: "Tipo", type: "text" },
    { name: "cultivo", label: "Cultivo", type: "text" },
    { name: "semente", label: "Semente", type: "text" },
    { name: "metroLinear", label: "Metro Linear", type: "number" },
    { name: "dosagem", label: "Dosagem (kg/ha)", type: "number" },
    { name: "toneladas", label: "Toneladas", type: "number" },
    { name: "adubo", label: "Adubo", type: "text" },
    { name: "prodTotal", label: "Prod. Total", type: "number" },
    { name: "prodPrevista", label: "Prod. Prevista", type: "number" },
    { name: "dataFimPlantio", label: "Data Fim Plantio", type: "date" },
    { name: "dataFimColheita", label: "Data Fim Colheita", type: "date" },
    { name: "tempoLavoura", label: "Tempo Lavoura (dias)", type: "number", disabled: true },
  ];
  const fieldsRealizada = [
    { name: "precMilimetrica", label: "Precipitação Milimétrica", type: "number" },
    { name: "umidade", label: "Umidade", type: "number" },
    { name: "impureza", label: "Impureza", type: "number" },
    { name: "graosAvariados", label: "Grãos Avariados", type: "number" },
    { name: "graosEsverdeados", label: "Grãos Esverdeados", type: "number" },
    { name: "graosQuebrados", label: "Grãos Quebrados", type: "number" },
    { name: "prodRealizada", label: "Prod. Realizada", type: "number" },
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
            const response = await axios.get(`http://localhost:3000/safras/${id}`);
            const { safra, gleba, property, owner } = response.data;
            setSafra(safra);
            setGleba(gleba);
            setProperty(property);
            setIsPlanejado(safra.type === "Planejado" ? true : false);
            console.log(isPlanejado);
            setLoading(false); 

        } catch (err) {
            console.error('Erro ao buscar SAFRAS:', err);  
        }finally {
          setLoading(false);
        }
      };
      fetchSafras();
    }
  }, [userData]);


const initialValues = safra ? {
    type: safra.type || "",
    cultivo: safra.cultivo || "",
    semente: safra.semente || "",
    metroLinear: safra.metroLinear || "",
    dosagem: safra.dosagem || "",
    toneladas: safra.toneladas || "",
    adubo: safra.adubo || "",
    dataFimPlantio: safra.dataFimPlantio || "",
    dataFimColheita: safra.dataFimColheita || "",
    tempoLavoura: safra.tempoLavoura || "",
    precMilimetrica: safra.precMilimetrica || "",
    umidade: safra.umidade || "",
    impureza: safra.impureza || "",
    graosAvariados: safra.graosAvariados || "",
    graosEsverdeados: safra.graosEsverdeados || "",
    graosQuebrados: safra.graosQuebrados || "",
    prodTotal: safra.prodTotal || "",
    prodPrevista: safra.prodPrevista || "",
    prodRealizada: safra.prodRealizada || "",
    porcentHect: safra.porcentHect || "",
    gleba: gleba.name || "",
    property: property.name || "",
} : {};

  const navigate = useNavigate(); 
  const handleFormSubmit = async (values) => {
    try {
      const response = await axios.put(`http://localhost:3000/safras/${id}`, {
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
        type: values.type,
        precMilimetrica: values.type === "Planejado" ? 0 : values.precMilimetrica,
        umidade:values.type === "Planejado" ? 0 : values.umidade,
        impureza:values.type === "Planejado" ? 0 : values.impureza,
        graosAvariados:values.type === "Planejado" ? 0 : values.graosAvariados,
        graosEsverdeados:values.type === "Planejado" ? 0 : values.graosEsverdeados,
        graosQuebrados:values.type === "Planejado" ? 0 : values.graosQuebrados,
        prodRealizada:values.type === "Planejado" ? 0 : values.prodRealizada,         
        
      });
  
      if (response.status === 200) {  
        navigate(`/safras?message=${encodeURIComponent("2")}`);
      }
    } catch (error) {
      console.error("Erro ao editar safra: " , error);
    }
  };

  if (loading || !safra || !gleba || !property) {
    return <Typography variant="h4" fontWeight="bold" sx={{ml: "50px"}}>Carregando...</Typography>;
  }
  
  return (
    <Box m="20px">
      <Header title="Editar Safra" subtitle="Edite as informações da Safra" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={!isPlanejado ? checkoutSchema : checkoutSchema2}
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
                    value={property.name}
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
                    error={!!touched[name] && !!errors[name]}
                    helperText={touched[name] && errors[name]}
                    sx={{ gridColumn: "span 1" }}
                    InputLabelProps={type === "date" ? { shrink: true } : {}}
                  />
                ))}
            </Box>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(2, minmax(0, 1fr))"
              mt= "30px"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                select
                fullWidth
                variant="filled"
                label="Tipo de Safra"
                value={values.type}
                onChange={(e) => {
                  const value = e.target.value;
                  setFieldValue("type", value); 
                  setIsPlanejado(value === "Planejado"); 
              }}
                helperText="Selecione o tipo de safra"
                InputLabelProps={{ shrink: true }}
                sx={{ gridColumn: "span 1",
                  "& .MuiFilledInput-root": {
                    backgroundColor: colors.mygreen[300], 
                  },
                  "& .Mui-focused": {
                    color: colors.mygreen[800], 
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: colors.mygreen[800], 
                  },
                 }}
              >
                {["Planejado", "Realizado"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
              
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              mt= "30px"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              
              {values.type !== "Planejado" && fieldsRealizada.map(({ name, label, type, disabled }) => (
                  <TextField
                    key={name}
                    fullWidth
                    variant="filled"
                    type={type}
                    label={label}
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    value={values[name] || ""}
                    name={name}
                    disabled={disabled}
                    error={!!touched[name] && !!errors[name]}
                    helperText={touched[name] && errors[name]}
                    sx={{ gridColumn: "span 1" }}
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
                Salvar
              </Button>
            </Box>
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
    metroLinear: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
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
    //porcentHect: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
});

const checkoutSchema2 = yup.object().shape({
  type: yup.string().required("Campo de preenchimento obrigatório"),
  cultivo: yup.string().required("Campo de preenchimento obrigatório"),
  semente: yup.string().required("Campo de preenchimento obrigatório"),
  metroLinear: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
  dosagem: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
  toneladas: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
  adubo: yup.string().required("Campo de preenchimento obrigatório"),
  dataFimPlantio: yup.date().required("Campo de preenchimento obrigatório").typeError("Deve ser uma data válida"),
  dataFimColheita: yup.date().required("Campo de preenchimento obrigatório").typeError("Deve ser uma data válida"),
  tempoLavoura: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
  prodTotal: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
  prodPrevista: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
});

const calculateTempoLavoura = (dataFimPlantio, dataFimColheita) => {
  if (dataFimPlantio && dataFimColheita) {
    const diff = new Date(dataFimColheita) - new Date(dataFimPlantio);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return "";
};
export default SafrasEditPage;
