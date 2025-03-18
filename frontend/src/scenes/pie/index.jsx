import { Box } from "@mui/material";
import Header from "../../components/Header";
import PieChart from "../../components/PieChart";

const Pie = () => {
  return (
    <Box m="20px">
      <Header title="Gráfico de Pizza de Custos" subtitle="Este gráfico apresenta a composição dos principais custos envolvidos nas operações da fazenda. Ele ajuda a visualizar como cada categoria de custo contribui para o total das despesas." />
      <Box height="75vh">
        <PieChart isDashboard={false}/>
      </Box>
    </Box>
  );
};

export default Pie;