import React, { useState, useEffect } from "react";
import axios from "axios";
import secureLocalStorage from 'react-secure-storage';
import { useNavigate,useParams } from 'react-router-dom';
import { Box, Typography, useTheme, Button, useMediaQuery,  Checkbox, FormControlLabel, Fade, Backdrop, Modal  } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const Propertie = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 800px)");
    const [userData, setUserData] = useState(null);
    const [propriedade, setPropriedade] = useState("");
    const [usuarios, setUsuarios] = useState([]);
    const [glebas, setGlebas] = useState([]);
    const [owner, setOwner] = useState("");
    const { id } = useParams(); 
    const [open, setOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const columnsUsers = [
        { field: "name", headerName: "Nome", flex: 1, cellClassName: "name-column--cell", resizable: false },
        { field: "email", headerName: "E-mail", flex: 1, cellClassName: "email-column--cell", resizable: false },
        {
            field: "access",
            headerName: "Nível de Acesso",
            flex: 1,
            headerAlign: "center",
            resizable: false,
            renderCell: ({ row: { access } }) => {
                if (access !== "owner") {
                    return null; 
                }
        
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
                        {!isMobile && (
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
                const { access } = params.row;

                return (
                    <Box 
                        display="flex" 
                        justifyContent="center" 
                        width="100%"
                        m="10px auto"
                    >
                        {userData.email === owner.email && (
                            <Button 
                                variant="contained" 
                                style={{ backgroundColor: access !== "owner" ? colors.redAccent[500] : colors.grey[800] }} 
                                onClick={() => handleDelete(params.row.id)}
                                sx={{ ml: 2 }} 
                                disabled={access === "owner"} 
                            >
                                <PersonRemoveIcon />
                            </Button>
                        )}
                        

                    </Box>
                );
            },
            headerAlign: "center"
        },
    ];

    const columnsGlebas = [
        { field: "name", headerName: "Nome", flex: 1, cellClassName: "name-column--cell", resizable: false },
        { field: "area", headerName: "Área", flex: 1, cellClassName: "area-column--cell", resizable: false },
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
            const fetchPropriedades = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/propriedades/${id}`);
                    const { propriedade, usuarios, owner, glebas } = response.data;
                    setPropriedade(propriedade);
                    setUsuarios(usuarios); 
                    setOwner(owner);
                    setGlebas(glebas)
                } catch (error) {
                    console.log("ERROR - ao buscar as propriedade.");
                }
            };
            fetchPropriedades();
        }
    }, [userData]);  

    const navigate = useNavigate(); 

    const handleEdit = () => {
        navigate(`/propriedades/edit/${id}`);
    }
    const handleView = (id) => {
        navigate(`/glebas/${id}`);
    };

    const handleAdd = () =>{
        navigate(`/glebas/add/${id}`);
    }

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setIsChecked(false);
    };

    const handleDelete = () =>{
        handleClose();
    }

    const handleCheckboxChange = (event) => {
        setIsChecked(event.target.checked);
    };

    return (
        <Box m="20px">
            <Header title="Propriedade" subtitle="Informações da propriedade" />
            <Box m="40px 0 0 0" height="75vh" maxWidth="1600px" mx="auto"
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
                        color: `${colors.mygreen[400]} !important`,
                    },
                }}>
                    

                    <Box
                        display="grid"
                        gridTemplateColumns="repeat(12, 1fr)"
                        gridAutoRows="140px"
                        gap="20px"
                        
                    >
                        <Box
                            gridColumn="span 12"
                            backgroundColor={colors.primary[400]}
                            display="grid"
                            gridTemplateColumns={isMobile ? "1fr" : "repeat(2, 1fr)"} 
                            padding="25px 35px 30px 35px"
                            height={isMobile ? "auto" : "initial"} 
                            minHeight={isMobile ? "260px" : "auto"} 
                        >
                            {/* Primeira Coluna */}
                            <Box display="flex" flexDirection="column" alignItems="flex-start">
                                <Box display="flex" alignItems="center" marginBottom="20px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Nome da Fazenda:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {propriedade.name}
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems="center" marginBottom="10px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Cidade:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {propriedade.city}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Segunda Coluna */}
                            <Box display="flex" flexDirection="column" alignItems="flex-start">
                                <Box display="flex" alignItems="center" marginBottom="20px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Nome do Dono:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                        {owner.name}
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems="center">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Área:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {propriedade.area} hectares
                                    </Typography>
                                </Box>
                                {userData && owner && userData.email === owner.email &&  (
                                    <Box 
                                        display="flex" 
                                        justifyContent="flex-end" 
                                        alignItems="flex-end" 
                                        flexGrow={1}
                                        width="100%" 
                                    >
                                        <Button 
                                            variant="contained" 
                                            onClick={handleOpen} 
                                            sx={{ backgroundColor:  colors.redAccent[500],
                                                "&:hover": {
                                                    backgroundColor: colors.grey[700], 
                                                },
                                            }} 

                                        >
                                            <DeleteIcon />
                                        </Button>
                                        <Modal
                                            open={open}
                                            onClose={null} 
                                            aria-labelledby="transition-modal-title"
                                            aria-describedby="transition-modal-description"
                                            closeAfterTransition
                                            slots={{ backdrop: Backdrop }}
                                            slotProps={{
                                            backdrop: {
                                                timeout: 500,
                                            },
                                            }}
                                        >
                                            <Fade in={open}>
                                                <Box 
                                                    sx={{ 
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        width: 450,
                                                        bgcolor: '#fff', // Cor de fundo branco puro para contraste
                                                        borderRadius: 3, // Cantos arredondados
                                                        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)', // Sombra suave e moderna
                                                        p: 4,

                                                    }}
                                                >
                                                    <Typography id="modal-modal-title" variant="h4" component="h2">
                                                        Deseja realmente deletar esta propriedade?
                                                    </Typography>
                                                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                                        Ao fazer isso, esteja ciente que:
                                                        <ul>
                                                            <li>Essa ação não pode ser revertida;</li>
                                                            <li>Ao deletar a propriedade, as glebas e safras correspondentes também serão apagadas.</li>
                                                        </ul>
                                                    </Typography>
                                                    
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={isChecked}
                                                                onChange={handleCheckboxChange} 
                                                            />
                                                        }
                                                        label="Estou ciente e quero continuar."
                                                        sx={{ mt: 2 }}
                                                    />
                                                    
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                                        <Button 
                                                            onClick={handleClose} 
                                                            sx={{
                                                                color: colors.redAccent[500]
                                                            }}
                                                        >
                                                            Cancelar
                                                        </Button>
                                                        <Button 
                                                            onClick={handleDelete} 
                                                            variant="contained" 
                                                            sx={{ backgroundColor:  colors.redAccent[500],
                                                                "&:hover": {
                                                                    backgroundColor: colors.grey[700], 
                                                                },
                                                            }}
                                                            disabled={!isChecked} 
                                                        >
                                                            Deletar
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Fade>
                                        </Modal>
                                        <Button 
                                            variant="contained" 
                                            onClick={() => handleEdit()} 
                                            sx={{ml:2,
                                                backgroundColor:colors.myorange[500],
                                                "&:hover": {
                                                    backgroundColor: colors.grey[700], 
                                                },
                                            }}

                                        >
                                            <EditIcon />
                                        </Button>
                                        <Button 
                                            variant="contained" 
                                            onClick={() => handleEdit(params.row)} 
                                            sx={{ml:2,
                                                backgroundColor:colors.blueAccent[500],
                                                "&:hover": {
                                                    backgroundColor: colors.grey[700], 
                                                },
                                            }}
                                        >
                                            <PersonAddAlt1Icon />
                                        </Button>
                                    </Box>
                                    
                                )}
                                
                            </Box>   
                        </Box>
                        {/* Tabela de Glebas & Tabela de usuários na fazenda */}
                        <Box
                            gridColumn="span 12"
                            display="flex"
                            alignItems="center"  
                            justifyContent="left"  
                            height="50px"
                            mt={isMobile ? "120px": "0px"}
                        >
                            <Typography variant="h4" fontWeight="bold" color={colors.grey[100]}>
                                Glebas da Propriedade
                            </Typography>
                        </Box>
                        <Box
                            gridColumn="span 12"
                            backgroundColor={colors.primary[400]}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minHeight="475px"
                            mt={isMobile ? "30px": -12}
                            >
                            {glebas.length === 0 ? (
                                <Box
                                    display="flex"
                                    flexDirection= "column"
                                    alignItems="center"  
                                    justifyContent="center"
                                    gap="20px"
                                >
                                    <Typography variant={isMobile ? "h6": "h5"} fontWeight="bold" color={colors.grey[100]}>
                                        Nenhuma gleba da propriedade foi encontrada.
                                    </Typography>
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
                                        <AddCircleOutlineIcon sx={{ mr: "10px" }} />
                                        {("Adicionar Gleba")}
                                    </Button>
                                </Box>
                            ) : (
                                <DataGrid
                                    rows={glebas}
                                    columns={columnsGlebas}

                                />
                            )}
                        </Box>
                        <Box
                            gridColumn="span 12"
                            display="flex"
                            alignItems="center"  
                            justifyContent="left"  
                            height="50px"
                            mt={isMobile ? "370px": 30}
                        >                       
                            <Typography variant="h4" fontWeight="bold" color={colors.grey[100]}>
                                Permissões da Propriedade
                            </Typography>
                        </Box> 
                        <Box
                        gridColumn="span 12"
                        backgroundColor={colors.primary[400]}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        minHeight="475px" 
                        mt={isMobile ? "290px": "155px"}
                        >
                            <DataGrid
                            rows={usuarios}
                            columns={columnsUsers}
                            sx={{mb:"20px"}}
                            localeText={{ noRowsLabel: <b>Nenhum usuário da propriedade foi encontrado.</b> }}
                        />
                        </Box>
                    </Box>
            </Box>
        </Box>
    );
};

export default Propertie;
