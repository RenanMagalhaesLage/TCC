import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme, Button, useMediaQuery,Snackbar, Alert  } from "@mui/material";
import { useNavigate,useLocation } from 'react-router-dom';
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import Header from "../../components/Header";
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import axios from "axios";
import { useParams } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';


const Properties = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 800px)");
    const isSmallDivice = useMediaQuery("(max-width: 1300px)");
    const [propriedades, setPropriedades] = useState([]);
    const [userData, setUserData] = useState(null);

    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const message = query.get('message');
    const [openSnackbar, setOpenSnackbar] = useState(!!message);
    const [snackbarMessage, setSnackbarMessage] = useState(message); 

    const columns = [
        { field: "id", headerName: "Id", flex: 1, cellClassName: "id-column--cell", resizable: false },
        { field: "name", headerName: "Nome", flex: 1, cellClassName: "name-column--cell", resizable: false },
        { field: "city", headerName: "Cidade", flex: 1, cellClassName: "city-column--cell", resizable: false },
        { field: "area", headerName: "Área", type: "number", headerAlign: "left", align: "left", resizable: false },
        {
            field: "access",
            headerName: "Nível de Acesso",
            flex: 1,
            headerAlign: "center",
            resizable: false,
            renderCell: ({ row: { access } }) => {
                return (
                    <Box
                        width="60%"
                        m="10px auto"
                        p="5px"
                        display="flex"
                        justifyContent="center"
                        backgroundColor={
                            access === "owner" ? colors.myorange[500] : colors.myorange[400]
                        }
                        borderRadius="4px"
                    >
                        {access === "owner" && <AdminPanelSettingsOutlinedIcon />}
                        {access === "permission" && <LockOpenOutlinedIcon />}
                        {!isSmallDivice && (
                            <Typography
                                sx={{ ml: "5px", fontWeight: "bold", color: theme.palette.mode === 'dark' ? "#FFFFFF" : colors.grey[100] }}
                            >
                                {access.charAt(0).toUpperCase() + access.slice(1)}
                            </Typography>
                        )}
                    </Box>
                );
            }
        },
        {
            field: "actions",
            headerName: "Ações",
            flex: 1,
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
            const fetchPropriedades = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/${userData.email}/propriedades`);
                    setPropriedades(response.data); 
                } catch (error) {
                    console.log("ERRO - ao buscar as propriedades.");
                }
            };
            fetchPropriedades();
        }
    }, [userData]);  

    useEffect(() => {
        console.log(propriedades); 
    }, [propriedades]);

    const navigate = useNavigate(); 
    const handleView = (id) => {
        navigate(`/propriedades/${id}`);
    };
    const handleAdd = () =>{
        navigate(`/propriedades/add`);
    }

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false); // Fecha o Snackbar
    };

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Propriedades" subtitle="Gerencie as suas propriedades" />
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
                        {!isMobile && ("Adicionar Propriedade")}
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
                    rows={propriedades}
                    columns={columns}
                    localeText={{ noRowsLabel: <b>Nenhuma propriedade encontrada.</b> }}

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
                      width: '550px', 
                      height: '70px',
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

export default Properties;
