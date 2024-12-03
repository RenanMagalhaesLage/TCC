import { Box, Button, IconButton, Typography, useTheme,  useMediaQuery } from "@mui/material";
import { tokens } from "../../theme";
import { mockTransactions } from "../../data/mockData";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";
import PieChart from "../../components/PieChart";
import FenceIcon from '@mui/icons-material/Fence';
import InfoBox from "../../components/InfoBox";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';

const DashboardProjetado = () => {
  const isMobile = useMediaQuery("(max-width: 800px)");
  const isSmallDivice = useMediaQuery("(max-width: 1300px)");
  const isMediumDivice = useMediaQuery("(max-width: 1800px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Painel Projetado" subtitle="Visualize o painel do custo agricula projetado" />

        <Box>
          <Button
            sx={{
              backgroundColor: colors.mygreen[400],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button>
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
        
      >
        {/* ROW 1 */}
        <Box
          gridColumn={isSmallDivice ? "span 6": "span 2"}
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
          gridColumn={isSmallDivice ? "span 6": "span 2"}
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
          gridColumn={isSmallDivice ? "span 12": "span 2"}
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
          gridColumn={isSmallDivice ? "span 6": "span 3"}
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
          gridColumn={isSmallDivice ? "span 6": "span 3"}
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
          gridColumn={isSmallDivice ? "span 6": "span 2"}
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
          gridColumn={isSmallDivice ? "span 6": "span 2"}
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
          gridColumn={isSmallDivice ? "span 6": "span 2"}
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
          gridColumn={isSmallDivice ? "span 6": "span 2"}
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
          gridColumn={isSmallDivice ? "span 6": "span 2"}
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
          gridColumn={isSmallDivice ? "span 6": "span 2"}
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
          gridColumn={isMediumDivice ? "span 12": "span 6"}
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
          gridColumn={isMediumDivice ? "span 12": "span 6"}
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
          <Box height="400px" m={isSmallDivice ? "-20px -100px 0 0" : "-20px -50px 0 0"}>
            <BarChart isDashboard={true} />
          </Box>
        </Box>
        {/* ROW 5 */}
        
        
        
      </Box>
    </Box>
  );
};

export default DashboardProjetado;