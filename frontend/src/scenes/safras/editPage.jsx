import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, useTheme, Autocomplete, useMediaQuery, MenuItem, IconButton, Modal, Backdrop, Fade, Chip,Tooltip,FormControlLabel,Checkbox } from "@mui/material";
import { useNavigate,useParams } from 'react-router-dom';
import { Formik,useFormikContext } from "formik";
import * as yup from "yup";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage'; 
import InfoIcon from '@mui/icons-material/Info';


const SafrasEditPage = () => {
  const { id } = useParams(); 
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isSmallDevice = useMediaQuery("(max-width: 800px)");
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [glebas, setGlebas] = useState([]);
  const [glebaOptions,setGlebaOptions] = useState([]);
  const [safra, setSafra] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlanejado, setIsPlanejado] = useState(true);
  const [openModalGleba, setOpenModalGleba] = useState(false);
  const [openModalSafra, setOpenModalSafra] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [safraStatus, setSafraStatus] = useState("");
  let formikRef = null;  

  const fields = [
    //{ name: "type", label: "Tipo", type: "text" },
    { name: "name", label: "Nome da Safra", type: "text" },
    { name: "cultivo", label: "Cultivo", type: "text" },
    { name: "semente", label: "Semente", type: "text" },
    { name: "dosagem", label: "Dosagem (kg/ha)", type: "number" },
    { name: "toneladas", label: "Toneladas", type: "number" },
    { name: "adubo", label: "Adubo", type: "text" },
    { name: "prodPrevista", label: "Prod. Prevista (sacos / ha)", type: "number" },
    { name: "precoVendaEstimado", label: "Preço de venda Estimado (R$ / saco)", type: "number" },
    { name: "dataFimPlantio", label: "Data Fim Plantio", type: "date" },
    { name: "dataFimColheita", label: "Data Fim Colheita", type: "date" },
    { name: "tempoLavoura", label: "Tempo Lavoura (dias)", type: "number", disabled: true },
  ];
  const fieldsRealizada = [
    { name: "precMilimetrica", label: "Precipitação Milimétrica", type: "number" },
    { name: "umidade", label: "Umidade (%)", type: "number" },
    { name: "impureza", label: "Impureza (%)", type: "number" },
    { name: "graosAvariados", label: "Grãos Avariados (%)", type: "number" },
    { name: "graosEsverdeados", label: "Grãos Esverdeados (%)", type: "number" },
    { name: "graosQuebrados", label: "Grãos Quebrados (%)", type: "number" },
    { name: "prodRealizada", label: "Prod. Realizada (sacos / ha)", type: "number" },
    { name: "precoVendaRealizado", label: "Preço de venda Realizado (R$ / saco)", type: "number" },
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
          const safra = response.data;
          const glebas = response.data.glebas;
          setSafra(safra);
          setSafraStatus(safra.status);
          setGlebas(glebas);
          setIsPlanejado(safra.type === "Planejado" ? true : false);
          setLoading(false); 

          const responseGlebas = await axios.get(`http://localhost:3000/glebas-available`, {
            params: { email: userData.email }
          });
          
          const glebaData = responseGlebas.data.map(gleba => ({
            id: gleba.id,
            name: `${gleba.name} - ${gleba.property.name}`
          }));
          setGlebaOptions(glebaData);

        } catch (error) {
            console.error('Erro ao buscar safras:', error);  
        }finally {
          setLoading(false);
        }
      };
      fetchSafras();
    }
  }, [userData]);

  const initialValues = safra ? {
    type: safra.type || "",
    cultivo: safra.crop || "",
    semente: safra.seed || "",
    dosagem: safra.dosage || "",
    toneladas: safra.tons || "",
    adubo: safra.fertilizer || "",
    dataFimPlantio: safra.plantingEndDate || "",
    dataFimColheita: safra.harvestEndDate || "",
    tempoLavoura: safra.fieldDuration || "",
    precMilimetrica: safra.rainfall || "",
    umidade: safra.moisture || "",
    impureza: safra.impurity || "",
    graosAvariados: safra.damagedGrains || "",
    graosEsverdeados: safra.greenGrains || "",
    graosQuebrados: safra.brokenGrains || "",
    prodPrevista: safra.expectedYield || "",
    prodRealizada: safra.actualYield || "",
    glebas: null,
    status: safra.status === false ? false : true,
    name: safra.name || "",
    precoVendaEstimado: safra.estimatedSalePrice || "",
    precoVendaRealizado: safra.actualSalePrice || "",
  } : {};

  const navigate = useNavigate(); 
  const handleFormSubmit = async (values) => {
    console.log(values)
    try {
      const response = await axios.put(`http://localhost:3000/safras`, {
        id: id,
        type: values.type,
        glebas: values.glebas ? values.glebas : null, 
        name: values.name,  
        status: safraStatus,
        crop: values.cultivo,
        seed: values.semente,
        dosage: values.dosagem,
        tons: values.toneladas,
        fertilizer: values.adubo,
        plantingEndDate: values.dataFimPlantio,
        harvestEndDate: values.dataFimColheita,
        fieldDuration: values.tempoLavoura,
        expectedYield: values.prodPrevista,
        rainfall: values.type === "Planejado" ? 0 : values.precMilimetrica,
        moisture:values.type === "Planejado" ? 0 : values.umidade,
        impurity:values.type === "Planejado" ? 0 : values.impureza,
        damagedGrains:values.type === "Planejado" ? 0 : values.graosAvariados,
        greenGrains:values.type === "Planejado" ? 0 : values.graosEsverdeados,
        brokenGrains:values.type === "Planejado" ? 0 : values.graosQuebrados,
        actualYield:values.type === "Planejado" ? 0 : values.prodRealizada, 
        estimatedSalePrice: values.precoVendaEstimado,
        actualSalePrice: values.type === "Planejado" ? 0 : values.precoVendaRealizado
      });
  
      if (response.status === 200) {  
        navigate(`/safras?message=${encodeURIComponent("2")}`);
      }
    } catch (error) {
      console.error("Erro ao editar safra: " , error);
    }
  };

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const handleOpenModalGleba = () => setOpenModalGleba(true);
  const handleOpenModalSafra = () => setOpenModalSafra(true);
  const handleFinalizar = async () =>{
    setIsChecked(false);
    setOpenModalSafra(false);
    setSafraStatus(true);

    if (formikRef) {
      await formikRef.submitForm(); 
    }
  };
  const handleAdicionarGleba = () =>{
    setOpenModalGleba(false);  
  };

  if (loading || !safra ) {
    return <Typography variant="h4" fontWeight="bold" sx={{ml: "50px"}}>Carregando...</Typography>;
  }
  
  return (
    <Box m="20px">
      <Header title="Editar Safra" subtitle="Edite as informações da Safra" />
      <Typography variant="body1" sx={{ mb: "20px", color: theme.palette.mode === 'dark' ? colors.primary[100] : colors.grey[600] }}>
        <IconButton sx={{ p: 0, mr: 1 }}>
          <InfoIcon fontSize="small" />
        </IconButton>
        Para finalizar a safra, ela precisa, primeiro, ser do tipo realizada.
      </Typography>

      <Formik
        innerRef={(ref) => (formikRef = ref)} 
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
                helperText="Troque aqui o tipo da Safra!"
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
              <Button 
                onClick={handleOpenModalGleba}
                sx={{ 
                  backgroundColor: colors.mygreen[400],
                  color: colors.grey[100],
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginLeft: "10px",
                  "&:hover": {
                    backgroundColor: colors.grey[700], 
                  },
                }} 
                variant="contained"
              >
                Adicionar Gleba
              </Button>
              <Modal
                open={openModalGleba}
                onClose={null} 
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                  backdrop: {
                    timeout: 500,
                  },
                }}
              >
                <Fade in={openModalGleba}>
                  <Box 
                    color={colors.grey[100]}
                    backgroundColor={colors.primary[400]}
                    sx={{ 
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 450,
                      borderRadius: 3, 
                      boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
                      p: 4,
                    }}
                  >
                    <Typography id="modal-modal-title" variant="h4" component="h2" >
                      Adicionar uma Gleba
                    </Typography>
                    <Box
                      gridColumn="span 12"
                      display="grid"
                      gridTemplateColumns={isMobile ? "1fr" : "repeat(1, 1fr)"}
                      padding="25px 0px"
                    >
                      <Box display="flex" flexWrap="wrap" gap="10px">
                        {glebas && glebas.map((gleba, index) => (
                          <Chip
                            key={index}
                            label={gleba.name} 
                            sx={{ padding: "10px", fontWeight: "bold", flexShrink: 0 }}
                          />
                        ))}
                      </Box>
                    </Box>    
                    <Typography variant="body1" sx={{ mb: "20px", color: theme.palette.mode === 'dark' ? colors.primary[100] : colors.grey[600] }}>
                      <IconButton sx={{ p: 0, mr: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                        Uma vez que uma Gleba é adicionada a uma Safra, essa ação não pode ser desfeita!
                    </Typography>
                    <Autocomplete
                      disablePortal
                      id="glebas"
                      multiple 
                      options={glebaOptions}
                      getOptionLabel={(option) => option.name || ""}
                      name="glebas"
                      value={
                        values.glebas && values.glebas.length > 0
                        ? glebaOptions.filter((option) => values.glebas.includes(option.id)) 
                        : []
                      }
                      onChange={(event, newValue) => {
                        setFieldValue('glebas', newValue.map((option) => option.id));
                      }}
                      onBlur={handleBlur}
                      sx={{ gridColumn: isSmallDevice ? "span 4" : "span 2" }}
                    
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Gleba"
                          variant="filled"
                          name="glebas"
                          error={!!touched.glebas && !!errors.glebas}
                          helperText={touched.glebas && errors.glebas}
                          onBlur={handleBlur}
                        />
                      )}
                      noOptionsText="Nenhuma Gleba Disponível"
                      />                                         
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Button 
                          onClick={() => {
                            setFieldValue('glebas', '');
                            setOpenModalGleba(false);
                          }} 
                            sx={{
                            color: colors.redAccent[500]
                          }}
                        >
                          Sair
                        </Button>
                        <Button 
                          onClick={handleAdicionarGleba} 
                          variant="contained" 
                          sx={{ 
                            color: colors.grey[100],
                            fontWeight: "bold",
                            backgroundColor:  colors.mygreen[400],
                            "&:hover": {
                              backgroundColor: colors.grey[700], 
                            },
                          }}
                        >
                        Salvar
                      </Button>
                    </Box>
                  </Box>
                </Fade>
              </Modal>              
              <Button 
                onClick={handleOpenModalSafra}
                sx={{ 
                  backgroundColor: colors.blueAccent[500],
                  color: colors.grey[100],
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginLeft: "10px",
                  "&:hover": {
                    backgroundColor: colors.grey[700], 
                  },
                }} 
                variant="contained"
                disabled={values.type === "Planejado"}
              >
                Finalizar Safra
              </Button>
              <Modal
                open={openModalSafra}
                onClose={null} 
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                  backdrop: {
                    timeout: 500,
                  },
                }}
              >
                <Fade in={openModalSafra}>
                  <Box 
                    color={colors.grey[100]}
                    backgroundColor={colors.primary[400]}
                    sx={{ 
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 450,
                      borderRadius: 3, 
                      boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
                      p: 4,
                    }}
                  >
                    <Typography id="modal-modal-title" variant="h4" component="h2" >
                      Deseja realmente finalizar esta Safra ?
                    </Typography>
                     <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Ao fazer isso, esteja ciente que:
                        <ul>
                          <li>Essa ação não pode ser revertida;</li>
                          <li>Você não poderá mais editar os dados desta Safra.</li>
                        </ul>
                    </Typography> 
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isChecked}
                          onChange={handleCheckboxChange} 
                        />
                      }
                      label="Estou ciente e quero continuar."
                      sx={{ mt: 2 }}
                    />                                        
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Button 
                          onClick={() => {
                            setOpenModalSafra(false);
                            setIsChecked(false);
                          }}
                            sx={{
                            color: colors.redAccent[500]
                          }}
                        >
                          Sair
                        </Button>
                        <Button 
                          onClick={handleFinalizar} 
                          variant="contained" 
                          sx={{ 
                            color: colors.grey[100],
                            fontWeight: "bold",
                            backgroundColor: colors.blueAccent[500],
                            "&:hover": {
                              backgroundColor: colors.grey[700], 
                            },
                          }}
                          disabled={!isChecked}
                        >
                        Finalizar
                      </Button>
                    </Box>
                  </Box>
                </Fade>
              </Modal>              
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  name: yup.string().required("Campo de preenchimento obrigatório"),
  type: yup.string().required("Campo de preenchimento obrigatório"),
  cultivo: yup.string().required("Campo de preenchimento obrigatório"),
  semente: yup.string().required("Campo de preenchimento obrigatório"),
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
  prodPrevista: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
  prodRealizada: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
  precoVendaEstimado: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
});

const checkoutSchema2 = yup.object().shape({
  name: yup.string().required("Campo de preenchimento obrigatório"),
  type: yup.string().required("Campo de preenchimento obrigatório"),
  cultivo: yup.string().required("Campo de preenchimento obrigatório"),
  semente: yup.string().required("Campo de preenchimento obrigatório"),
  dosagem: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
  toneladas: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
  adubo: yup.string().required("Campo de preenchimento obrigatório"),
  dataFimPlantio: yup.date().required("Campo de preenchimento obrigatório").typeError("Deve ser uma data válida"),
  dataFimColheita: yup.date().required("Campo de preenchimento obrigatório").typeError("Deve ser uma data válida"),
  tempoLavoura: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
  prodPrevista: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
  precoVendaEstimado: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
});

const calculateTempoLavoura = (dataFimPlantio, dataFimColheita) => {
  if (dataFimPlantio && dataFimColheita) {
    const diff = new Date(dataFimColheita) - new Date(dataFimPlantio);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return "";
};

export default SafrasEditPage;
