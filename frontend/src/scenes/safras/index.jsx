import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme, Button, useMediaQuery,Snackbar,Alert,Tooltip,IconButton  } from "@mui/material";
import { useNavigate,useLocation } from 'react-router-dom';
import axios from "axios";
import secureLocalStorage from 'react-secure-storage';
import { DataGrid,GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataFazenda, mockDataSafra } from "../../data/mockData";
import Header from "../../components/Header";
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const Safras = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 800px)");
    const isSmallDivice = useMediaQuery("(max-width: 1300px)");

    const [safras, setSafras] = useState([]);
    const [userData, setUserData] = useState(null);

    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const message = Number(query.get('message'));
    const [openSnackbar, setOpenSnackbar] = useState(!!message);
    const [snackbarMessage, setSnackbarMessage] = useState(""); 

    const columns = [
        { field: "propertie", headerName: "Propriedade", flex: 1, minWidth: 150, cellClassName: "name-column--cell", resizable: false },
        { field: "gleba", headerName: "Gleba", flex: 2, minWidth: 150, cellClassName: "name-column--cell", resizable: false },
        { field: "area", headerName: "Área da Gleba", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        {
            field: "type",
            headerName: "Tipo",
            flex: 1,
            headerAlign: "center",
            minWidth: 200,
            resizable: false,
            renderCell: ({ row: { type } }) => {
                return (
                    <Box
                        width="60%"
                        m="10px auto"
                        p="5px"
                        display="flex"
                        justifyContent="center"
                        backgroundColor={
                            type === "Planejado" ? colors.orangeAccent[500] : colors.orangeAccent[300]
                        }
                        borderRadius="4px"
                        sx={{color: theme.palette.mode === 'dark' ?colors.primary[400]: colors.grey[100]}}
                    >
                        {type === "Planejado" && <EqualizerIcon/>}
                        {type === "Realizado" && <TimelineIcon />}
                        {!isSmallDivice && (
                            <Typography
                                sx={{ ml: "5px", fontWeight: "bold"}}
                            >
                                {type}
                            </Typography>
                        )}
                    </Box>
                );
            }
        },    
        /*    
        { field: "status", headerName: "Status", flex: 1, type: "boolean", resizable: false, minWidth: 170,
            renderCell: ({ row: { status } }) => (
              <Box
                  width="60%"
                  m="10px auto"
                  p="5px"
                  display="flex"
                  justifyContent="center"
                  backgroundColor={status ? "red" : "green"}
                  borderRadius="4px"
              >
                  <Typography sx={{ fontWeight: "bold", color: "#FFFFFF" }}>
                      {status ? "Finalizada" : "Andamento"}
                  </Typography>
              </Box>
            )
        },*/
        { field: "cultivo", headerName: "Cultivo", flex: 1, minWidth: 100, cellClassName: "city-column--cell", resizable: false },
        { field: "semente", headerName: "Semente", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "metroLinear", headerName: "Metro Linear", type: "number", headerAlign: "left", align: "left", minWidth: 120, resizable: false },
        { field: "dosagem", headerName: "Dosagem", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "toneladas", headerName: "Toneladas", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "adubo", headerName: "Adubo", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "dataFimPlantio", headerName: "Fim Plantio", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "dataFimColheita", headerName: "Fim Colheita", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "tempoLavoura", headerName: "Tempo Lavoura", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "precMilimetrica", headerName: "Preção Milimetrica", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { 
            field: "umidade", 
            headerName: "Umidade", 
            type: "number", 
            headerAlign: "left", 
            align: "left", 
            minWidth: 100, 
            resizable: false, 
            renderCell: ({ row: { umidade } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {umidade + "%"}
                </Typography>
            )}
        },
        
        { 
            field: "impureza", 
            headerName: "Impureza", 
            type: "number", 
            headerAlign: "left", 
            align: "left", 
            minWidth: 100, 
            resizable: false,
            renderCell: ({ row: { impureza } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {impureza + "%"}
                </Typography>
            )}
        },
        { 
            field: "graosAvariados", 
            headerName: "Grãos Avariados", 
            type: "number", 
            headerAlign: "left", 
            align: "left", 
            minWidth: 100, 
            resizable: false,
            renderCell: ({ row: { graosAvariados } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {graosAvariados + "%"}
                </Typography>
            )}
         },
        { 
            field: "graosEsverdeados", 
            headerName: "Grãos Esverdeados", 
            type: "number", 
            headerAlign: "left", 
            align: "left", 
            minWidth: 100, 
            resizable: false,
            renderCell: ({ row: { graosEsverdeados } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {graosEsverdeados + "%"}
                </Typography>
            )}
         },
         { 
            field: "graosQuebrados", 
            headerName: "Grãos Quebrados", 
            type: "number", 
            headerAlign: "left", 
            align: "left", 
            minWidth: 100, 
            resizable: false,
            renderCell: ({ row: { graosQuebrados } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {graosQuebrados + "%"}
                </Typography>
            )}
         },
        { field: "prodTotal", headerName: "Prod. Total", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "prodPrevista", headerName: "Prod. Prevista", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "prodRealizada", headerName: "Prod. Realizada", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { 
            field: "comparativo", 
            headerName: "Comparativo", 
            type: "number", 
            headerAlign: "center", 
            minWidth: 100, 
            resizable: false,
            renderCell: ({ row: { prodPrevista, prodRealizada  } }) => {
                const isHigher = prodRealizada > prodPrevista; 

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
                    >
                        {isHigher ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />} 
                    </Box>
                );
            }
         },
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

        },
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
                        {isMobile ? (
                            <>
                                <Tooltip title="Visualizar">
                                    <IconButton onClick={() => handleView(id)} sx={{ color: colors.greenAccent[500]}}>
                                        <VisibilityIcon />
                                    </IconButton>
                                </Tooltip>
                            </>
                        ):(
                            <>
                                <Tooltip title="Visualizar">
                                    <Button
                                        variant="contained"
                                        sx={{
                                            backgroundColor: colors.greenAccent[500],
                                            "&:hover": {
                                                backgroundColor: colors.grey[700], 
                                            },
                                        }}
                                        onClick={() => handleView(id)}
                                    >
                                        <VisibilityIcon />
                                    </Button>
                                </Tooltip>
                            </>
                        )}
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
            const fetchSafras = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/searchSafras/${userData.email}`);
                    const linhasDaTabela = response.data.flatMap(fazenda => {
                        return fazenda.glebas.flatMap(gleba => { 
                            return gleba.safras.map(safra => ({  
                                id: safra.id,   
                                gleba: gleba.name,
                                propertie: fazenda.name,
                                area: gleba.area,
                                type: safra.type,  
                                status: safra.status,
                                cultivo: safra.cultivo,
                                semente: safra.semente, 
                                metroLinear: safra.metroLinear, 
                                dosagem: safra.dosagem, 
                                toneladas: safra.toneladas, 
                                adubo: safra.adubo, 
                                dataFimPlantio: safra.dataFimPlantio, 
                                dataFimColheita: safra.dataFimColheita, 
                                tempoLavoura: safra.tempoLavoura, 
                                precMilimetrica: safra.precMilimetrica, 
                                umidade: safra.umidade, 
                                impureza: safra.impureza, 
                                graosAvariados: safra.graosAvariados, 
                                graosEsverdeados: safra.graosEsverdeados, 
                                graosQuebrados: safra.graosQuebrados, 
                                prodTotal: safra.prodTotal, 
                                prodPrevista: safra.prodPrevista, 
                                prodRealizada: safra.prodRealizada, 
                                porcentHect: safra.porcentHect,
                                access: fazenda.access
                            }));
                        });
                    });

                    setSafras(linhasDaTabela);

                    
                } catch (error) {
                    console.log("ERRO - ao buscar as glebas.");
                }
            };
            fetchSafras();
        }
    }, [userData]);  

    useEffect(() => {
        //console.log(glebas); 
    }, [safras]);

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
                <Header title="Safras" subtitle="Gerencie as suas safras" />
                <Box>
                    <Button
                        sx={{
                        backgroundColor: colors.mygreen[400],
                        color: colors.grey[100],
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: "10px 20px",
                        }}
                        onClick={() => handleAdd()}
                    >
                        <AddCircleOutlineIcon sx={{ mr: isMobile? "0px" :"10px" }} />
                        {!isMobile && ("Adicionar Safra")}
                    </Button>
                </Box>
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
                                Nenhuma safra encontrada.
                            </Typography>
                        </Box>
                ) : (
                    <DataGrid
                        rows={safras}
                        columns={columns}
                        slots={{ toolbar: GridToolbar, }}
                    />
                )}
            </Box>
            <div>
                {message !== 0 && (
                    <Snackbar 
                    open={openSnackbar} 
                    autoHideDuration={2500} 
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity="success"
                        variant="filled"
                        sx={{ 
                        width:'450px',
                        fontSize:'20px',
                        height: '60px',
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center', 
                    }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
                )}
            </div>
        </Box>
    );
};

export default Safras;
