import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme, Button, useMediaQuery  } from "@mui/material";
import { DataGrid,GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useNavigate,useLocation } from 'react-router-dom';
import axios from "axios";
import secureLocalStorage from 'react-secure-storage';
import Header from "../../components/Header";
import VisibilityIcon from '@mui/icons-material/Visibility';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const SafrasHistory = () => {
    const token = secureLocalStorage.getItem('auth_token');
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 800px)");
    const isSmallDivice = useMediaQuery("(max-width: 1300px)");
    const [userData, setUserData] = useState(null);
    const [safras, setSafras] = useState("");

    const columns = [
        { field: "name", headerName: "Nome", flex: 2, minWidth: 150, cellClassName: "name-column--cell", resizable: false },
        { field: "totalArea", headerName: "Área", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "crop", headerName: "Cultivo", flex: 1, minWidth: 100, cellClassName: "city-column--cell", resizable: false },
        { field: "seed", headerName: "Semente", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "dosage", headerName: "Dosagem", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "tons", headerName: "Toneladas", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "fertilizer", headerName: "Adubo", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "plantingEndDate", headerName: "Fim Plantio", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "harvestEndDate", headerName: "Fim Colheita", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "fieldDuration", headerName: "Tempo Lavoura", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "rainfall", headerName: "Preção Milimetrica", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { 
            field: "moisture", 
            headerName: "Umidade", 
            type: "number", 
            headerAlign: "left", 
            align: "left", 
            minWidth: 100, 
            resizable: false, 
            renderCell: ({ row: { moisture } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {moisture + "%"}
                </Typography>
            )}
        }, 
        { 
            field: "impurity", 
            headerName: "Impureza", 
            type: "number", 
            headerAlign: "left", 
            align: "left", 
            minWidth: 100, 
            resizable: false,
            renderCell: ({ row: { impurity } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {impurity + "%"}
                </Typography>
            )}
        },
        { 
            field: "damagedGrains", 
            headerName: "Grãos Avariados", 
            type: "number", 
            headerAlign: "left", 
            align: "left", 
            minWidth: 100, 
            resizable: false,
            renderCell: ({ row: { damagedGrains } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {damagedGrains + "%"}
                </Typography>
            )}
         },
        { 
            field: "greenGrains", 
            headerName: "Grãos Esverdeados", 
            type: "number", 
            headerAlign: "left", 
            align: "left", 
            minWidth: 100, 
            resizable: false,
            renderCell: ({ row: { greenGrains } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {greenGrains + "%"}
                </Typography>
            )}
         },
         { 
            field: "brokenGrains", 
            headerName: "Grãos Quebrados", 
            type: "number", 
            headerAlign: "left", 
            align: "left", 
            minWidth: 100, 
            resizable: false,
            renderCell: ({ row: { brokenGrains } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {brokenGrains + "%"}
                </Typography>
            )}
         },
        { field: "expectedYield", headerName: "Prod. Prevista", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "actualYield", headerName: "Prod. Realizada", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { 
            field: "comparativo", 
            headerName: "Comparativo", 
            type: "number", 
            headerAlign: "center", 
            minWidth: 100, 
            resizable: false,
            renderCell: ({ row: { expectedYield, actualYield  } }) => {
                const isHigher = actualYield > expectedYield; 

                return (
                    <Box
                        width="40%"
                        m="10px auto"
                        p="5px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        backgroundColor={isHigher ? colors.mygreen[500] : colors.redAccent[500]} 
                        borderRadius="4px"
                        color={"#fff" }
                    >
                        {isHigher ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />} 
                    </Box>
                );
            }
        },
        /*
        {
            field: "porcentHect",
            headerName: "Porcentagem / HA",
            headerAlign: "center",
            flex: 1,
            align: "center",
            minWidth: 120,
            resizable: false,
            renderCell: ({ row: { porcentHect } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {porcentHect + "%"}
                </Typography>
            )}

        },*/
        {
            field: "actions",
            headerName: "Ações",
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                const { id } = params.row;

                return (
                    <Box 
                        display="flex" 
                        justifyContent="center" 
                        width="100%"
                        m="10px auto"
                    >
                        <Button 
                            variant="contained" 
                            sx={{ backgroundColor: colors.greenAccent[500],
                                "&:hover": {
                                    backgroundColor: colors.grey[700], 
                                },
                             }} 
                             onClick={() => handleView(id)}
                        >
                            <VisibilityIcon />
                        </Button>

                    </Box>
                );
            },
            headerAlign: "center"
        },  
    ];

    useEffect(() => {
        const storedUser = secureLocalStorage.getItem('userData'); 
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        if (userData && userData.email) { 
            const fetchSafrasData = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/safras-by-user`, {
                        headers: {Authorization: `Bearer ${token}`}
                    });
                    
                    const safrasFinalizadas = response.data.filter(safra => safra.status === true);
                    setSafras(safrasFinalizadas);
                } catch (error) {
                    if (error.response?.status === 401) {
                        alert('Sessão expirada. Faça login novamente.');
                        secureLocalStorage.removeItem('userData');
                        secureLocalStorage.removeItem('auth_token');
                        window.location.href = '/login';
                    } else {
                        console.log("ERRO - ao buscar as safras finalizadas.");
                    }
                    
                }
            };
            fetchSafrasData();
        }
    }, [userData]);

    const navigate = useNavigate(); 
    const handleView = (id) => {
        navigate(`/safras/${id}`);
    };
    const handleAdd = () =>{
        navigate(`/safras/add`);
    }

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Histórico Safras" subtitle="Gerencie as suas safras finalizadas" />
            </Box>
            <Box m="20px 0 0 0" height="75vh" maxWidth="1600px" mx="auto"
                sx={{
                    "& .MuiDataGrid-root": {
                        border: "none",
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: "none",
                    },
                    "& .name-column--cell": {
                        color: colors.mygreen[700],
                    },
                    "& .MuiDataGrid-columnHeader": {
                        backgroundColor: colors.mygreen[400],
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.mygreen[400],
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.mygreen[200]} !important`,
                    },
                }}>
                {safras.length === 0 ? (
                        <Box
                            display="flex"
                            flexDirection= "column"
                            alignItems="center"  
                            justifyContent="center"
                            gap="20px"
                            mt="50px"
                        >
                            <Typography variant={isMobile ? "h6": "h5"} fontWeight="bold" color={colors.grey[100]}>
                                Nenhuma safra finalizada encontrada.
                            </Typography>
                        </Box>
                ) : ( 
                    <DataGrid
                        rows={safras}
                        columns={columns}
                        slots={{ toolbar: CustomToolbar }}
                    />
                )}
            </Box>
        </Box>
    );
};

function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton /> {/* Botão de exibição de colunas */}
        <GridToolbarFilterButton />  {/* Botão de filtro */}
        <GridToolbarDensitySelector /> {/* Seletor de densidade */}
      </GridToolbarContainer>
    );
}

export default SafrasHistory;
