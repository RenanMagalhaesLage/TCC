import { Box } from "@mui/material";
import Header from "../../components/Header";
import PieChart from "../../components/PieChart";
import { useParams } from 'react-router-dom';

const Pie = () => {
  const { id } = useParams();
  return (
    <Box m="20px">
      <Header title="Gráfico de Pizza de Custos" subtitle="" />
      <Box height="75vh">
        <PieChart isDashboard={false} safraId={id}/>
      </Box>
    </Box>
  );
};

export default Pie;