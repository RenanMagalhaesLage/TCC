import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";

const InfoBox = ({ title, subtitle, icon }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      width="100%"
      m="0 30px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
    >
      <Box>
        {icon}
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{ color: colors.grey[100] }}
        >
          {title}
        </Typography>
      </Box>
      <Box mt="2px">
        <Typography variant="h5" sx={{ color: colors.mygreen[500] }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

export default InfoBox;
