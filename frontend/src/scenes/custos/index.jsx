import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme, Button, useMediaQuery,Snackbar, Alert} from "@mui/material";
import { useNavigate,useLocation } from 'react-router-dom';
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataFazenda } from "../../data/mockData";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import Header from "../../components/Header";
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import secureLocalStorage from 'react-secure-storage';
import axios from "axios";


const Custos = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 800px)");
    const isSmallDivice = useMediaQuery("(max-width: 1300px)");
    const [glebas, setGlebas] = useState([]);
    const [userData, setUserData] = useState(null);

    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const message = Number(query.get('message'));
    const [openSnackbar, setOpenSnackbar] = useState(!!message);
    const [snackbarMessage, setSnackbarMessage] = useState(""); 

    useEffect(() => {
        switch (message) {
          case 1:
            setSnackbarMessage("Gleba criada!");
            break;
    
          case 2:
            setSnackbarMessage("Edição realizada!");
            break;
    
          case 3:
            setSnackbarMessage("Gleba excluída!");
            break;
    
          default:
            //console.log("Mensagem não reconhecida.");
            break;
        }
      }, [message]);

      const columns = [
        { field: "name", headerName: "Nome", flex: 1, cellClassName: "name-column--cell", resizable: false },
        { field: "propertie", headerName: "Propriedade", flex: 1, cellClassName: "propertie-column--cell", resizable: false },
        { field: "gleba", headerName: "Gleba", flex: 1, cellClassName: "gleba-column--cell", resizable: false },
        { field: "type", headerName: "Tipo", flex: 1, resizable: false },

    ];
    
    
    useEffect(() => {
        const storedUser = secureLocalStorage.getItem('userData'); 
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        if (userData && userData.email) { 
            const fetchGlebas = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/searchGlebas/${userData.email}`);
                    const linhasDaTabela = response.data.flatMap(fazenda => {
                        return fazenda.glebas.map(gleba => ({
                            id: gleba.id, 
                            name: gleba.name, 
                            propertie: fazenda.name, 
                            area: gleba.area, 
                            access: fazenda.access 
                        }));
                    });

                    setGlebas(linhasDaTabela);

                    
                } catch (error) {
                    console.log("ERRO - ao buscar as glebas.");
                }
            };
            fetchGlebas();
        }
    }, [userData]);  

    useEffect(() => {
        //console.log(glebas); 
    }, [glebas]);

    const navigate = useNavigate(); 
    const handleView = (id) => {
        navigate(`/custos/${id}`);
    };

    const handleAdd = () =>{
        navigate(`/custos/add`);
    }

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false); 
    };

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">

                <Header title="Custos" subtitle="Gerencie os seus custos" />
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
                        {!isMobile && ("Adicionar Custo")}
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
                <DataGrid
                    rows={glebas}
                    columns={columns}
                    localeText={{ noRowsLabel: <b>Nenhum custo encontrado.</b> }}
                />
            </Box>
            <div>
                {message && (
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
                        width: '450px', 
                        height: '60px',
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center', 
                        fontSize: '20px',
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

export default Custos;
