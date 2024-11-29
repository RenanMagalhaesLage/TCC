import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme, Button, useMediaQuery,Snackbar, Alert,Tooltip,IconButton,} from "@mui/material";
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


const Custos = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 800px)");
    const isSmallDivice = useMediaQuery("(max-width: 1300px)");
    const [userData, setUserData] = useState(null);

    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const message = Number(query.get('message'));
    const [openSnackbar, setOpenSnackbar] = useState(!!message);
    const [snackbarMessage, setSnackbarMessage] = useState(""); 
    const [custosData, setCustosData] = useState([]);

    useEffect(() => {
        switch (message) {
          case 1:
            setSnackbarMessage("Custo adicioando!");
            break;
    
          case 2:
            setSnackbarMessage("Edição realizada!");
            break;
    
          case 3:
            setSnackbarMessage("Custo excluído!");
            break;
    
          default:
            //console.log("Mensagem não reconhecida.");
            break;
        }
      }, [message]);

      const columns = [
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
        { field: "category", headerName: "Categoria", flex: 1,  resizable: false },
        { field: "name", headerName: "Nome", flex: 1,  resizable: false },
        { field: "unit", headerName: "Unidade", flex: 1, resizable: false },
        { field: "quantity", headerName: "Quantidade", flex: 1, resizable: false },
        { field: "price", headerName: "Preço", flex: 1,  resizable: false },
        { field: "totalValue", headerName: "Valor Total", flex: 1,  resizable: false },
        { field: "date", headerName: "Data", flex: 1, resizable: false },
        { field: "note", headerName: "Observação", flex: 1, resizable: false },
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
            const fetchCustosData = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/user`, {
                        params: { email: userData.email }
                    });
                    const linhasDaTabela = response.data.flatMap(fazenda => {
                        return fazenda.glebas.flatMap(gleba => { 
                            return gleba.safras.flatMap(safra => {  
                                return safra.custos.map(custo => ({
                                    id: custo.id,
                                    type: custo.type,
                                    status: custo.status,
                                    category: custo.category,
                                    name: custo.name,
                                    unit: custo.unit,
                                    quantity: custo.quantity,
                                    price: custo.price,
                                    totalValue: custo.totalValue,
                                    date: custo.date,
                                    note: custo.note,
                                }))
                            });
                        });
                    });

                    setCustosData(linhasDaTabela);                      

                    
                } catch (error) {
                    console.log("ERRO - ao buscar os Custos.");
                }
            };
            fetchCustosData();
        }
    }, [userData]);  

    useEffect(() => {
        //console.log(glebas); 
    }, [custosData]);

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
                    rows={custosData}
                    columns={columns}
                    slots={{ toolbar: CustomToolbar }}
                    getRowId={(row) => row.id}
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


function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton /> {/* Botão de exibição de colunas */}
        <GridToolbarFilterButton />  {/* Botão de filtro */}
        <GridToolbarDensitySelector /> {/* Seletor de densidade */}
      </GridToolbarContainer>
    );
}
