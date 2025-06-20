import React, { useState, useEffect } from "react";
import { Box, Typography,TextField, useTheme, Button, useMediaQuery,Snackbar,Alert,Tooltip,IconButton, Paper, Tabs, Tab} from "@mui/material";
import { DataGrid,GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector } from '@mui/x-data-grid';
import { styled } from '@mui/system';
import { useNavigate,useLocation } from 'react-router-dom';
import axios from "axios";
import secureLocalStorage from 'react-secure-storage';
import { tokens } from "../../theme";
import Header from "../../components/Header";
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const Safras = () => {
    const token = secureLocalStorage.getItem('auth_token');
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 800px)");
    const isSmallDivice = useMediaQuery("(max-width: 1300px)");

    const [safrasPlanejadas, setSafrasPlanejadas] = useState("");
    const [safrasRealizadas, setSafrasRealizadas] = useState("");
    const [userData, setUserData] = useState(null);

    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const message = Number(query.get('message'));
    const [openSnackbar, setOpenSnackbar] = useState(!!message);
    const [snackbarMessage, setSnackbarMessage] = useState(""); 
    const [safraType, setSafraType] = useState(0);

    useEffect(() => {
        switch (message) {
          case 1:
            setSnackbarMessage("Safra criada!");
            break;
    
          case 2:
            setSnackbarMessage("Edição realizada!");
            break;
    
          case 3:
            setSnackbarMessage("Safra excluída!");
            break;
    
          default:
            //console.log("Mensagem não reconhecida.");
            break;
        }
      }, [message]);

    const columnsPlanejadas = [
        { field: "name", headerName: "Nome", flex: 1, minWidth: 100, cellClassName: "name-column--cell", resizable: false },
        { field: "totalArea", headerName: "Área", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },    
        { field: "crop", headerName: "Cultivo", flex: 1, minWidth: 100, cellClassName: "city-column--cell", resizable: false },
        { field: "seed", headerName: "Semente", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "dosage", headerName: "Dosagem", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "tons", headerName: "Toneladas", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "fertilizer", headerName: "Adubo", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "plantingEndDate", headerName: "Fim Plantio", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "harvestEndDate", headerName: "Fim Colheita", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "fieldDuration", headerName: "Tempo Lavoura", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "expectedYield", headerName: "Prod. Prevista", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
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

    const columnsRealizadas = [
        { field: "name", headerName: "Nome", flex: 1, minWidth: 100, cellClassName: "name-column--cell", resizable: false },
        { field: "totalArea", headerName: "Área", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },    
        { field: "crop", headerName: "Cultivo", flex: 1, minWidth: 70, cellClassName: "city-column--cell", resizable: false },
        { field: "rainfall", headerName: "Precipitação Milimetrica", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
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
         { field: "actualYield", headerName: "Prod. Realizada", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
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
            const fetchSafrasData = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/safras-by-user`, {
                        headers: {Authorization: `Bearer ${token}`}
                    });

                    const safrasEmAndamento = response.data.filter(safra => safra.status === false);

                    const safrasPlanejadas = safrasEmAndamento.filter(safra => safra.type === 'Planejado');
                    const safrasRealizadas = safrasEmAndamento.filter(safra => safra.type === 'Realizado');
                    
                    setSafrasPlanejadas(safrasPlanejadas);
                    setSafrasRealizadas(safrasRealizadas);
                } catch (error) {
                    if (error.response?.status === 401) {
                        alert('Sessão expirada. Faça login novamente.');
                        secureLocalStorage.removeItem('userData');
                        secureLocalStorage.removeItem('auth_token');
                        window.location.href = '/login';
                    } else {
                        console.log("ERRO - ao buscar as glebas.");
                    }
                    
                }
            };
            fetchSafrasData();
        }
    }, [userData]);  

    useEffect(() => {
        //console.log(glebas); 
    }, [safrasPlanejadas, safrasRealizadas]);

    const navigate = useNavigate(); 
    const handleView = (id) => {
        navigate(`/safras/${id}`);
    };
    const handleAdd = () =>{
        navigate(`/safras/add`);
    }

    const handleTabChange = (newValue) => {
        setSafraType(newValue);
        //console.log(safraType)
      };

      const CustomTabs = styled(Tabs)({
        color:colors.grey[100], 
        backgroundColor: 'transparent', 
        '& .MuiTabs-indicator': {
          backgroundColor: colors.mygreen[400], 
          height: '4px', 
        },
      });
    
      const CustomTab = styled(Tab)({
        '&.Mui-selected': {
        color:  colors.grey[100], 
        },
         '&.MuiTab-root': {
        backgroundColor: colors.primary[400], // Cor de fundo para abas não selecionadas
        },
        '&:hover': {
        color:  colors.mygreen[400], 
        },
      });

      const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false); // Fecha o Snackbar
    };

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
            <Box m="20px 0 0 0" height="75vh" maxWidth="1600px" mx="auto" mb="90px"
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
                <Paper square sx={{ width: '100%', maxWidth: '200px', margin: '0 auto' }}>
                    <CustomTabs
                        value={safraType}
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={(event, newValue) => handleTabChange(newValue)}
                    >
                        <CustomTab  label="Planejada" icon={<EqualizerIcon/>} />
                        <CustomTab  label="Realizada" icon={<TimelineIcon />}/>
                    </CustomTabs>
                </Paper>
                {safrasPlanejadas.length === 0 && safrasRealizadas.length === 0 ? (
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
                        rows={safraType === 0 ? safrasPlanejadas : safrasRealizadas}
                        columns={safraType === 0 ? columnsPlanejadas : columnsRealizadas}
                        slots={{ toolbar: CustomToolbar }}
                        localeText={{ noRowsLabel: safraType === 0 ? <h2>Nenhuma safra planejada encontrada.</h2> :  <h2>Nenhuma safra realizada encontrada.</h2>}}
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


function CustomToolbar() {
    const theme = useTheme();
    const colors = theme.palette.mode;
    return (
      <GridToolbarContainer >
        <Box sx={{
            '& .MuiButton-root': { 
              color: colors === 'dark' ?'#f2f0f0' :  "#1F2A40" , 
            },
            display: 'flex',
          }}>
          <GridToolbarColumnsButton  /> 
          <GridToolbarFilterButton /> 
          <GridToolbarDensitySelector  /> 
        </Box>
      </GridToolbarContainer>
    );
};