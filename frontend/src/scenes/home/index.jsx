import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme, Button, useMediaQuery,Snackbar, Alert,Tooltip,IconButton, Paper, Avatar, } from "@mui/material";
import { useNavigate,useLocation } from 'react-router-dom';
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import TimelineIcon from '@mui/icons-material/Timeline';
import secureLocalStorage from 'react-secure-storage';
import axios from "axios";
import PieChart from "../../components/PieChart";
import AgricultureIcon from '@mui/icons-material/Agriculture';


const Home = () => {
    const navigate = useNavigate(); 
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 800px)");
    const isSmallDevice = useMediaQuery("(max-width: 1300px)");
    const isMediumDevice = useMediaQuery("(max-width: 1800px)");
    const [userData, setUserData] = useState(null);

    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const message = Number(query.get('message'));
    const [openSnackbar, setOpenSnackbar] = useState(!!message);
    const [snackbarMessage, setSnackbarMessage] = useState(""); 
    const [custosData, setCustosData] = useState([]);

    const avatarStyle = {
        backgroundColor: colors.mygreen[500],
        marginBottom: '30px',
        width: 100,
        height: 100,
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)'
    };


    useEffect(() => {
        const storedUser = secureLocalStorage.getItem('userData'); 
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
    }, []);

    const handleClickPie = () => {
        navigate(`/grafico-pizza/0`); 
      };

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="" subtitle="" />
            </Box>

            <Box height="75vh" maxWidth="1600px" mx="auto">
                <Box
                    display="flex"
                    flexDirection= "column"
                    alignItems="center"  
                    justifyContent="center"
                    gap="20px"
                    mt="10px"
                >
                    <Avatar style={avatarStyle}>
                        <AgricultureIcon sx={{ fontSize: 50 }} />
                    </Avatar>
                    <Typography variant={isMobile ? "h3" : "h2"} fontWeight="bold" color={colors.grey[100]} textAlign="center">
                        Bem vindo ao 
                        <span 
                            style={{ 
                                color: colors.mygreen[500], 
                                fontStyle: 'italic', 
                                textTransform: 'uppercase',
                                textAlign: 'center',  
                                display: 'inline-block',  
                                marginLeft: '10px' 
                            }}>
                             SmartPlantio
                        </span>
                    </Typography>
                </Box>
                
                <Box
                    mt="80px"
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
                        <Box
                            mt="25px"
                        >
                            <Typography
                                variant="h5"
                                fontWeight="600"
                                color={colors.grey[100]}
                            >
                                Custos por categoria das suas safras atuais
                            </Typography> 
                        </Box>
                    <Box>
                        <Tooltip title="Visualizar">
                            <IconButton onClick={() => handleClickPie()}>
                                <VisibilityIcon
                                    sx={{ fontSize: "26px", color: colors.mygreen[500] }}
                                />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    </Box>
                    <Box height="400px" mt="-20px">
                        <PieChart isDashboard={true} safraId={0}/>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Home;
