import { Box } from "@mui/material";
import Header from "../../components/Header";
import BarChart2 from "../../components/BarChart2";

const Bar = () => {
  return (
    <Box m="20px">
      <Header title="Bar Chart" subtitle="Simple Bar Chart" />
      <Box height="75vh">
        <BarChart2 isDashboard={false}/>
      </Box>
    </Box>
  );
};

export default Bar;