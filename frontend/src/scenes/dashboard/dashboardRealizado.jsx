import React, { useState, useEffect, useCallback } from "react";
import { Box, Button,IconButton,Select, TextField,Grid, Typography, useTheme, Autocomplete, useMediaQuery,MenuItem,Tooltip, FormControl, InputLabel,} from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import VisibilityIcon from '@mui/icons-material/Visibility';
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import BarChartHectares from "../../components/BarChartHectares";
import BarChartCategory from "../../components/BarChartCategory";
import BarChartCustos from "../../components/BarChartCustos";
import InfoBox from "../../components/InfoBox";
import { Formik, Form, Field } from "formik";
import secureLocalStorage from 'react-secure-storage';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import * as yup from "yup";

const DashboardRealizado = () => {
  const navigate = useNavigate(); 
  const isMobile = useMediaQuery("(max-width: 800px)");
  const isSmallDevice = useMediaQuery("(max-width: 1300px)");
  const isMediumDevice = useMediaQuery("(max-width: 1800px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [userData, setUserData] = useState(null);
  const [safraOptions, setSafraOptions] = useState([]);
  const [safraData, setSafraData] = useState(null)
  const [safraId, setSafraId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [propertyOptions,setPropertyOptions] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  const initialValues = {
    safra: "",
    property: ""
  };  

  useEffect(() => {
    const storedUser = secureLocalStorage.getItem('userData'); 
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);
    
  useEffect(() => {
    if (userData && userData.email) { 
      const fetchSafraData = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/safras-by-user`, {
            params: { email: userData.email }
          });
                      
          const safras = response.data
            .filter(safra => safra.type === "Realizado")
            .map(safra => ({
              id: safra.id,
              name: `${safra.name} - ${safra.crop}`
          }));
          setSafraOptions(safras);

        } catch (error) {
          console.log("ERRO - ao buscar no banco de dados.");
        }
      };
      fetchSafraData();
    }
  }, [userData]);  

  const fetchPropertyData = useCallback(async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/properties-by-safra`, {
        params: { id: id }
      });
      setPropertyOptions(response.data);
      
    } catch (error) {
      console.error('Erro ao buscar dados da propriedades da safra:', error);
    }
  }, []);

  const handleClickBarraCustos = (id) => {
    navigate(`/grafico-barra-custos/${id}`); 
  };
  
  const handleClickBarraCategory = (id) => {
    navigate(`/grafico-barra-category/${id}`); 
  };

  const   handleClickBarraHectares = (id) => {
    navigate(`/grafico-barra-hectares/${id}`); 
  };

  const handleFormSubmit = async (values) => {
    setShowPanel(false);
    setSafraId(values.safra);
    setPropertyId(values.property);  
  
    try {
      const response = await axios.get(`http://localhost:3000/report-safra`, {
        params: { id: values.safra }  
      });

      setSafraData(response.data);
  
      setShowPanel(true); 
    } catch (error) {
      console.error('Erro ao buscar dados da safra:', error);
    }
  
    setTimeout(() => {
      setShowPanel(true);
    }, 300); 
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Painel Custo Agrícola Realizado" subtitle="Visualize o painel do custo agricula realizado" />
      </Box>

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
      {({ values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue }) => (
        <Form>
          <Box
            display="grid"
            gap="30px"
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          >
            <Autocomplete
              disablePortal
              id="safras"
              options={safraOptions}
              getOptionLabel={(option) => option.name || ""}
              name="safra"
              sx={{ gridColumn: isMobile ? "span 4" : "span 2" }}
              value={
                values.safra 
                  ? safraOptions.find((option) => option.id === values.safra) 
                  : null
              } 
              onChange={(event, value) => {
                setFieldValue('safra', value?.id || null);
                if (value) {
                  setSafraId(value?.id);
                  fetchPropertyData(value?.id); 
                }
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Safra"
                  variant="filled"
                  name="property"
                  error={!!touched.safra && !!errors.safra}
                  helperText={touched.safra && errors.safra}
                  onBlur={handleBlur} 
                />
              )}
              noOptionsText="Nenhuma Safra disponível"
            />     
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
              sx={{ gridColumn: isMobile ? "span 4" : "span 2" }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Propriedade"
                  variant="filled"
                  name="property"
                  error={!!touched.property && !!errors.property}
                  helperText={touched.property && errors.property}
                  onBlur={handleBlur} 
                />
              )}
              noOptionsText="Nenhuma propriedade disponível"
            />  
          </Box>
          <Box
            display="grid"
            gridTemplateColumns="repeat(12, 1fr)"
            gridAutoRows="100px"
            gap="20px"
          >
            {/* Botão de Envio */}
            <Box
              gridColumn={"span 12"}
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
            >
              <Button
                type="submit"
                sx={{
                  backgroundColor: colors.mygreen[400],
                  color: colors.grey[100],
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "10px 20px",
                }}
              >
                Gerar Painel
              </Button>
            </Box>
          </Box>
        </Form>
      )}
      </Formik>
      

      {/* GRID & CHARTS */}
      {showPanel && (
              <Box
              display="grid"
              gridTemplateColumns="repeat(12, 1fr)"
              gridAutoRows="140px"
              gap="20px"
            >
              {/* ROW 1 */}
              <Box
                gridColumn={isSmallDevice ? "span 6": "span 2"}
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)", 
                }}
              >
                <InfoBox
                  title={safraData ? safraData.totalArea : ""}
                  subtitle="Hectares"
                />
              </Box>
              <Box
                gridColumn={isSmallDevice ? "span 6": "span 2"}
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)", 
                }}
              >
                <InfoBox
                  title={safraData ? "R$ " + safraData.precoVenda : ""}
                  subtitle="Preço venda R$ / ha "
      
                />
              </Box>
              <Box
                gridColumn={isSmallDevice ? "span 12": "span 2"}
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)", 
                }}
              >
                <InfoBox
                  title={safraData ? "R$ " + safraData.custoTotal : ""}
                  subtitle="Custo Total"
                />
              </Box>
              <Box
                gridColumn={isSmallDevice ? "span 12": "span 2"}
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)", 
                }}
              >
                <InfoBox
                  title={safraData ? "R$ " + safraData.custoMedio : ""}
                  subtitle="Custo médio / ha "
                />
              </Box>
              <Box
                gridColumn={isSmallDevice ? "span 12": "span 2"}
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)", 
                }}
              >
                <InfoBox
                  title={safraData ? safraData.difProd + "%" : ""}
                  subtitle="Dif. Prod. Prev vs. Real "
                />
              </Box>
              <Box
                gridColumn={isSmallDevice ? "span 6": "span 2"}
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)", 
                }}
              >
                <InfoBox
                  title={safraData ? safraData.prodEstimada : ""}
                  subtitle="Prod. Realizada (SCS)"
                />
              </Box>
              <Box
                gridColumn={isSmallDevice ? "span 6": "span 2"}
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)", 
                }}
              >
                <InfoBox
                  title={safraData ? safraData.pontoEquilibrio: ""}
                  subtitle="Ponto Equilibrio (SCS)"
                />
              </Box>

              {/* ROW 2 */}
              <Box
                gridColumn={isSmallDevice ? "span 12": "span 2"}
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)", 
                }}
              >
                <InfoBox
                  title={safraData ? "R$ " + safraData.receitaBruta : ""}
                  subtitle="Receita Bruta"
                />
              </Box>
              <Box
                gridColumn={isSmallDevice ? "span 12": "span 2"}
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)", 
                }}
              >
                <InfoBox
                  title={safraData ? "R$ " + safraData.lucroTotal : ""}
                  subtitle="Lucro Total"
                />
              </Box>
              <Box
                gridColumn={isSmallDevice ? "span 12": "span 2"}
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)", 
                }}
              >
                <InfoBox
                  title={safraData ? "R$ " + safraData.lucroHect: ""}
                  subtitle="Lucro / ha"
                />
              </Box>

              <Box
                gridColumn={isSmallDevice ? "span 6": "span 2"}
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)", 
                }}
              >
                <InfoBox
                  title={safraData ? safraData.rentabilidadeLair + "%": ""}
                  subtitle="Rentabilidade (LAIR %)"
                />
              </Box>
              <Box
                gridColumn={isSmallDevice ? "span 6": "span 2"}
                backgroundColor={colors.primary[400]}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)", 
                }}
              >
                <InfoBox
                  title={safraData ? safraData.rentabilidadeFinal + "%": ""}
                  subtitle="Rentabilidade Final"
                />
              </Box>
              {/* ROW 3 */}
              <Box
                gridColumn={isMediumDevice ? "span 12": "span 6"}
                gridRow= "span 3"
                backgroundColor={colors.primary[400]}
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)", 
                }}
              >
                <Box
                  mt="25px"
                  p="0 30px"
                  display="flex "
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="600"
                      color={colors.grey[100]}
                    >
                      Custos por categoria
                    </Typography>
                    
                  </Box>
                  <Box>
                    <Tooltip title="Visualizar">
                      <IconButton onClick={() => handleClickBarraCustos(safraId)}>
                        <VisibilityIcon
                          sx={{ fontSize: "26px", color: colors.mygreen[500] }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Box height="400px" m="-20px 0 0 0">
                  <BarChartCustos isDashboard={true} safraId={safraId}/>
                </Box>
              </Box>
              <Box
                gridColumn={isMediumDevice ? "span 12": "span 6"}
                gridRow="span 3"
                backgroundColor={colors.primary[400]}
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)", 
                }}
              >
                <Box
                  mt="25px"
                  p="0 30px"
                  display="flex "
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="600"
                      color={colors.grey[100]}
                    >
                      Custos por categoria por Gleba
                    </Typography>
                    
                  </Box>
                  <Box>
                    <Tooltip title="Visualizar">
                      <IconButton onClick={() => handleClickBarraCategory(safraId)}>
                        <VisibilityIcon
                          sx={{ fontSize: "26px", color: colors.mygreen[500] }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Box height="400px"  m="-20px 0 0 0">
                  <BarChartCategory isDashboard={true} safraId={safraId}/>
                </Box>
              </Box>
              {/* ROW 4 */}
              <Box
                gridColumn="span 12"
                gridRow="span 3"
                backgroundColor={colors.primary[400]}
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.09)", 
                }}
              >
                <Box
                  mt="25px"
                  p="0 30px"
                  display="flex "
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="600"
                      color={colors.grey[100]}
                    >
                      Custo médio por hectare por Gleba
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Visualizar">
                      <IconButton onClick={() => handleClickBarraHectares(safraId)}>
                        <VisibilityIcon
                          sx={{ fontSize: "26px", color: colors.mygreen[500] }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Box height="400px" m={isSmallDevice ? "-20px -0 0 0" : "-20px 0 0 0"}>
                  <BarChartHectares isDashboard={true} safraId={safraId}/>
                </Box>
              </Box>
              {/* ROW 5 */}
      
              
              
            </Box>
      )}
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  safra: yup.number().required('Campo de preenchimento obrigatório'),
  note: yup.number(),
});

export default DashboardRealizado;