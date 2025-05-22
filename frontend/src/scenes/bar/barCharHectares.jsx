import { Box } from "@mui/material";
import Header from "../../components/Header";
import BarChart from "../../components/BarChartHectares";
import { useParams } from 'react-router-dom';


const Bar = () => {
  const { id, type } = useParams();

  return (
    <Box m="20px">
      <Header title="Custo médio por hectare por Talhão" subtitle="" />
      <Box height="75vh">
        <BarChart isDashboard={false} safraId={id} safraType={type}/>
      </Box>
    </Box>
  );
};

export default Bar;