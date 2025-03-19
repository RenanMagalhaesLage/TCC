import React, { useState, useEffect } from "react";
import { Box, Button,IconButton,Select, TextField,Grid, Typography, useTheme, Autocomplete, useMediaQuery,MenuItem,Tooltip, FormControl, InputLabel,} from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import VisibilityIcon from '@mui/icons-material/Visibility';
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import BarChart from "../../components/BarChart";
import BarChart2 from "../../components/BarChart2";
import PieChart from "../../components/PieChart";
import InfoBox from "../../components/InfoBox";
import { Formik, Form, Field } from "formik";
import secureLocalStorage from 'react-secure-storage';
import axios from "axios";

const DashboardProjetado = () => {
  const isMobile = useMediaQuery("(max-width: 800px)");
  const isSmallDevice = useMediaQuery("(max-width: 1300px)");
  const isMediumDevice = useMediaQuery("(max-width: 1800px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [userData, setUserData] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [safraOptions, setsafraOptions] = useState([]);

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
      const fetchPieData = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/custos-pie-chart`, {
            params: { safraId: 1 }
          });
                      
  
          setPieData(response.data);   
          setsafraOptions([
            { id: 1, name: "Safra 1" },
            { id: 2, name: "Safra 2" },
            { id: 3, name: "Safra 3" }
          ]);

                        
        } catch (error) {
          console.log("ERRO - ao buscar no banco de dados.");
        }
      };
      fetchPieData();
    }
  }, [userData]);  
  

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Painel Custo Agrícola Projetado" subtitle="Visualize o painel do custo agricula projetado" />
      </Box>

      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {
          console.log(values);
        }}
      >
      {({ values, handleChange,handleBlur, setFieldValue }) => (
        <Form>
          <Box
            display="grid"
            gap="30px"
            gridTemplateColumns="repeat(12, 1fr)"
          >
            <Autocomplete
              disablePortal
              id="properties"
              options={safraOptions}
              getOptionLabel={(option) => option.name || ""}
              name="property"
              sx={{ gridColumn: isMobile ? "span 12" : "span 4" }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Safra"
                  variant="filled"
                  name="property"
                  onBlur={handleBlur} 
                />
              )}
              noOptionsText="Não Encontrado"
            />      
          </Box>
          <Box
            display="grid"
            gridTemplateColumns="repeat(12, 1fr)"
            gridAutoRows="100px"
            gap="20px"
          >
            {/*
            <Box
              gridColumn={isSmallDevice ? "span 12": "span 3"}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <TextField
                  select
                  fullWidth
                  variant="filled"
                  label="Selecione uma Propriedade"
                  value={values.primarySelection}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFieldValue("primarySelection", value);
                    setFieldValue("secondarySelection", ""); 
                    handlePrimaryChange(value);
                  }}
                  InputLabelProps={{ shrink: true }}

              >
                  {options.Propriedade.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>
            <Box
              gridColumn={isSmallDevice ? "span 12": "span 3"}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <TextField
                  select
                  fullWidth
                  variant="filled"
                  label="Selecione uma Gleba"
                  value={values.primarySelection}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFieldValue("primarySelection", value);
                    setFieldValue("secondarySelection", ""); 
                    handlePrimaryChange(value);
                  }}
                  InputLabelProps={{ shrink: true }}

              >
                  {options.Propriedade.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>
            <Box
              gridColumn={isSmallDevice ? "span 12": "span 3"}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <TextField
                  select
                  fullWidth
                  variant="filled"
                  label="Selecione um Cultivo"
                  value={values.primarySelection}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFieldValue("primarySelection", value);
                    setFieldValue("secondarySelection", ""); 
                    handlePrimaryChange(value);
                  }}
                  InputLabelProps={{ shrink: true }}

              >
                  {options.Propriedade.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>
            */}

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
            title="1.242"
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
            title="69,52"
            subtitle="Prod / Hectare"
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
            title="R$ 165,00"
            subtitle="Preço venda R$ / HA "

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
            title="R$ 7.547"
            subtitle="Custo médio / HA "
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
            title="45,80"
            subtitle="Ponto Equilibrio (SCS)"
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
            title="74,48"
            subtitle="Prod. Estimada (SCS)"
          />
        </Box>
        {/* ROW 2 */}
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
            title="R$ 9.181.446"
            subtitle="Custo Total"
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
            title="R$ 15.250.069"
            subtitle="Receita Bruta"
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
            title="R$ 4.742"
            subtitle="Lucro / Hectare"
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
            title="R$ 6.068.624"
            subtitle="Lucro Total"
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
            title="38,4%"
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
            title="34,5%"
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
                <IconButton>
                  <VisibilityIcon
                    sx={{ fontSize: "26px", color: colors.mygreen[500] }}
                  />
                </IconButton>
              </Tooltip>
              
            </Box>
          </Box>
          <Box height="400px" m="-20px 0 0 0">
            <PieChart isDashboard={true} safraId={1}/>
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
                <IconButton>
                  <VisibilityIcon
                    sx={{ fontSize: "26px", color: colors.mygreen[500] }}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Box height="400px"  m="-20px 0 0 0">
            <BarChart2 isDashboard={true} />
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
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.mygreen[500]}
              >
                $59,342.32
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Visualizar">
                <IconButton>
                  <VisibilityIcon
                    sx={{ fontSize: "26px", color: colors.mygreen[500] }}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Box height="400px" m={isSmallDevice ? "-20px -0 0 0" : "-20px 0 0 0"}>
            <BarChart isDashboard={true} />
          </Box>
        </Box>
        {/* ROW 5 */}

        
        
      </Box>
    </Box>
  );
};

export default DashboardProjetado;