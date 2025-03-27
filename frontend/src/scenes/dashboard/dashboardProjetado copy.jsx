import React, { useState } from "react";
import { Box, Button,IconButton,Select, TextField,Grid, Typography, useTheme, Autocomplete, useMediaQuery,MenuItem, FormControl, InputLabel,} from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import BarChart from "../../components/BarChart";
import PieChart from "../../components/PieChart";
import InfoBox from "../../components/InfoBox";
import { Formik, Form, Field } from "formik";

const DashboardProjetado = () => {
  const isMobile = useMediaQuery("(max-width: 800px)");
  const isSmallDevice = useMediaQuery("(max-width: 1300px)");
  const isMediumDevice = useMediaQuery("(max-width: 1800px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const options = {
    Propriedade: ["Propriedade A", "Propriedade B", "Propriedade C"],
    Gleba: ["Gleba X", "Gleba Y", "Gleba Z"],
    Safra: ["Safra 2023", "Safra 2024", "Safra 2025"],
  };

  const [dependentOptions, setDependentOptions] = useState([]);

  const handlePrimaryChange = (value) => {
    setDependentOptions(options[value] || []);
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Painel Custo Agrícola Projetado" subtitle="Visualize o painel do custo agricula projetado" />

      </Box>

      <Formik
        initialValues={{
          primarySelection: "",
          secondarySelection: "",
        }}
        onSubmit={(values) => {
          console.log(values);
        }}
      >
      {({ values, handleChange, setFieldValue }) => (
        <Form>
          <Box
            display="grid"
            gridTemplateColumns="repeat(12, 1fr)"
            gridAutoRows="100px"
            gap="20px"
          >
            <Box
              gridColumn={isSmallDevice ? "span 12": "span 4"}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {/* Campo de Seleção Principal */}
              <TextField
                  select
                  fullWidth
                  variant="filled"
                  label="Selecione uma categoria"
                  value={values.primarySelection}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFieldValue("primarySelection", value);
                    setFieldValue("secondarySelection", ""); // Reseta o campo dependente
                    handlePrimaryChange(value);
                  }}
                  helperText="Escolha entre Propriedade, Gleba ou Safra"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    gridColumn: isSmallDevice ? "span 6" : "span 4",
                    
                  }}
              >
                  {["Propriedade", "Gleba", "Safra"].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>
            <Box
              gridColumn={isSmallDevice ? "span 12": "span 4"}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {/* Campo de Seleção Dependente */}
              <TextField
                select
                fullWidth
                variant="filled"
                label={
                  values.primarySelection
                    ? `Selecione um(a) ${values.primarySelection}`
                    : "Escolha a categoria primeiro"
                }
                value={values.secondarySelection}
                onChange={(e) => setFieldValue("secondarySelection", e.target.value)}
                disabled={!values.primarySelection}
                helperText={`Escolha uma opção `}
                InputLabelProps={{ shrink: true }}
                sx={{
                  gridColumn: isSmallDevice ? "span 6" : "span 4",
    
                }}
              >
                {dependentOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Botão de Envio */}
            <Box
              gridColumn={isSmallDevice ? "span 12" : "span 4"}
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{
                marginTop: "-20px"
              }}
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
            title="R$ 165,00"
            subtitle="Preço venda R$ / HÁ "

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
            subtitle="Custo médio / HÁ "
          />
        </Box>
        <Box
          gridColumn={isSmallDevice ? "span 6": "span 3"}
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
          gridColumn={isSmallDevice ? "span 6": "span 3"}
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
            subtitle="Lucro / HÁ"
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
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.mygreen[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height="400px" m="-20px 0 0 0">
            <PieChart isDashboard={true} />
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
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.mygreen[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height="400px"  m="-20px -50px 0 0">
            <LineChart isDashboard={true} />
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
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.mygreen[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height="400px" m={isSmallDevice ? "-20px -100px 0 0" : "-20px -50px 0 0"}>
            <BarChart isDashboard={true} safraId={safraId}/>
          </Box>
        </Box>
        {/* ROW 5 */}
        
        
        
      </Box>
    </Box>
  );
};

export default DashboardProjetado;