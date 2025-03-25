import { Box } from "@mui/material";
import Header from "../../components/Header";
import PieChart from "../../components/PieChart";

const Pie = () => {
  return (
    <Box m="20px">
      <Header title="Gráfico de Pizza de Custos" subtitle="" />
      <Box height="75vh">
        <PieChart isDashboard={false}/>
      </Box>
    </Box>
  );
};

export default Pie;