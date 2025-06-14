import { Box } from "@mui/material";
import Header from "../../components/Header";
import BarChart from "../../components/BarChartCustos";
import { useParams } from 'react-router-dom';


const Bar = () => {
  const { id } = useParams();

  return (
    <Box m="20px">
      <Header title="Custos por categoria" subtitle="" />
      <Box height="75vh">
        <BarChart isDashboard={false} safraId={id}/>
      </Box>
    </Box>
  );
};

export default Bar;