import React, { useState, useEffect } from "react";
import axios from "axios";
import secureLocalStorage from 'react-secure-storage';
import { useNavigate,useParams } from 'react-router-dom';
import { Box, Typography, useTheme, Button, useMediaQuery,  Checkbox, FormControlLabel, Fade, Backdrop, Modal,Tooltip,IconButton   } from "@mui/material";
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
    const isSmallDivice = useMediaQuery("(max-width: 1300px)");
    const [userData, setUserData] = useState(null);
    const [property, setProperty] = useState("");
    const [users, setUsers] = useState([]);
    const [glebas, setGlebas] = useState([]);
    const [owner, setOwner] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const [storageItems, setStorageItems]= useState([]);
    const { id } = useParams(); 
    const [open, setOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [openRemove, setOpenRemove] = useState(false); 

    const columnsUsers = [
        { field: "name", headerName: "Nome", flex: 1, minWidth: 100, cellClassName: "name-column--cell", resizable: false },
        { field: "email", headerName: "E-mail", flex: 1, minWidth: 100, cellClassName: "email-column--cell", resizable: false },
        {
            field: "access",
            headerName: "Nível de Acesso",
            flex: 1,
            minWidth: 100,
            headerAlign: "center",
            resizable: false,
            renderCell: ({ row: { user_properties } }) => {        
                return (
                    <Box
                        width="60%"
                        m="10px auto"
                        p="5px"
                        display="flex"
                        justifyContent="center"
                        backgroundColor={
                            user_properties.access === "owner" ? colors.orangeAccent[500] : colors.orangeAccent[300]
                        }
                        borderRadius="4px"
                        sx={{color: theme.palette.mode === 'dark' ?colors.primary[400]: colors.grey[100]}}
                    >
                        {user_properties.access === "owner" && <AdminPanelSettingsOutlinedIcon />}
                        {user_properties.access === "guest" && <LockOpenOutlinedIcon />}
                        {!isSmallDivice && (
                            <Typography
                                sx={{ ml: "5px", fontWeight: "bold", }}
                            >
                                {user_properties.access === "owner" ? "Proprietário" : "Permissão"}
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
            minWidth: 100,
            renderCell: (params) => {
                const { user_properties } = params.row;
                return (
                    <Box 
                        display="flex" 
                        justifyContent="center" 
                        width="100%"
                        m="10px auto"
                    >
                        <Modal
                            open={openRemove}
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
                            <Fade in={openRemove}>
                                <Box 
                                    color={colors.grey[100]}
                                    backgroundColor={colors.primary[400]}
                                    sx={{ 
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: 450,
                                        borderRadius: 3, 
                                        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
                                        p: 4,
                                    }}
                                >
                                    <Typography id="modal-modal-title" variant="h4" component="h2">
                                        Deseja realmente remover este usuário da propriedade?
                                    </Typography>
                                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                        Ao fazer isso, esteja ciente que:
                                        <ul>
                                            <li>Essa ação não pode ser revertida;</li>
                                            <li>O usuário removido perderá o acesso total a todos os dados e recursos relacionados a essa propriedade.</li>
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
                                            onClick={handleCloseRemove} 
                                            sx={{
                                                color: colors.redAccent[500]
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button 
                                            onClick={() => handleRemoveUser(user_properties.propertyId, user_properties.userId)} 
                                            variant="contained" 
                                            sx={{ backgroundColor:  colors.redAccent[500],
                                                "&:hover": {
                                                    backgroundColor: colors.grey[700], 
                                                },
                                            }}
                                            disabled={!isChecked} 
                                        >
                                            Remover
                                        </Button>
                                    </Box>
                                </Box>
                            </Fade>
                        </Modal>
                        {isMobile ? (
                            <>
                                <Tooltip title="Remover">
                                    <IconButton 
                                        onClick={() => handleOpenRemove()}  
                                        style={{ color: !isOwner ? colors.grey[800] : user_properties.access !== "owner" ? colors.redAccent[500] : colors.grey[800] }}  
                                        disabled={user_properties.access === "owner" || !isOwner } 
                                    >
                                        <PersonRemoveIcon />
                                    </IconButton>
                                </Tooltip>
                            </>
                        ):(
                            <>
                                <Tooltip title="Remover">
                                    <Button 
                                        variant="contained" 
                                        style={{ backgroundColor: !isOwner ? colors.grey[800] : user_properties.access !== "owner" ? colors.redAccent[500] : colors.grey[800] }} 
                                        onClick={() => handleOpenRemove()}
                                        sx={{ ml: 2 }} 
                                        disabled={user_properties.access === "owner" || !isOwner } 
                                    >
                                        <PersonRemoveIcon />
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

    const columnsGlebas = [
        { field: "name", headerName: "Nome", flex: 1,minWidth: 100, cellClassName: "name-column--cell", resizable: false },
        { field: "area", headerName: "Área", flex: 1,minWidth: 100, cellClassName: "area-column--cell", resizable: false },
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

    const columnsStorageItems = [
        { field: "storedLocation", headerName: "Localização", flex: 1, minWidth: 180,  resizable: false },
        { field: "category", headerName: "Categoria", flex: 1, minWidth: 100, resizable: false },
        { field: "name", headerName: "Nome", flex: 1, minWidth: 100, resizable: false },
        { field: "unit", headerName: "Unidade", flex: 1, minWidth: 100, resizable: false },
        { field: "quantity", headerName: "Quantidade", flex: 1, minWidth: 100, resizable: false },
        { field: "price", headerName: "Preço", flex: 1,  minWidth: 100, resizable: false },
        { field: "totalValue", headerName: "Valor Total", flex: 1, minWidth: 100, resizable: false },
        { field: "expirationDate", headerName: "Data de Validade", flex: 1, minWidth: 100, resizable: false },
        { field: "note", headerName: "Observação", flex: 1, minWidth: 100, resizable: false },
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
                                    <IconButton onClick={() => handleViewStorageItem(id)} sx={{ color: colors.greenAccent[500]}}>
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
                                        onClick={() => handleViewStorageItem(id)}
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
            const fetchPropriedades = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/properties/${id}`);
                    const property = response.data;
                    const users = property.users;
                    setProperty(property);
                    setUsers(users); 
                    console.log(users);
                    const owner = users.filter(user => user.user_properties.access == 'owner');
                    setOwner(owner[0]);
                    setIsOwner(userData.email === owner[0].email);
                    console.log(userData.email === owner[0].email)
                    setGlebas(property.glebas);
                    setStorageItems(property.storage_items);
                } catch (error) {
                    console.log(`ERROR - ao buscar as propriedade de id = ${id}.`);
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

    const handleViewStorageItem = (id) =>{
        navigate(`/estoque/${id}`);
    }

    const handleAdd = () =>{
        navigate(`/glebas/add/${id}`);
    }

    const handleInvite = () =>{
        navigate(`/convites/add/${id}`);
    }

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setIsChecked(false);
    };

    const handleOpenRemove = () => setOpenRemove(true);

    const handleCloseRemove = () => {
        setOpenRemove(false);
        setIsChecked(false);
    };
    const handleRemoveUser = async (propertyId, userId) =>{
        console.log("Usuário removido");
        try {
            const response = await axios.delete(`http://localhost:3000/user-properties`, {
                params: { propertyId: propertyId, userId: userId }
            });
            navigate(`/propriedades?message=${encodeURIComponent("5")}`);
        } catch (error) {
            console.error("Erro ao remover usuário da propriedade:", error);
        }
        handleCloseRemove();
    }

    const handleDelete = () =>{
        handleClose();
    }



    const handleCheckboxChange = (event) => {
        setIsChecked(event.target.checked);
    };

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Propriedade" subtitle="Informações da propriedade" />
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
                        {!isMobile && ("Adicionar Gleba")}
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
                            sx={{boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",}}
                        >
                            {/* Primeira Coluna */}
                            <Box display="flex" flexDirection="column" alignItems="flex-start">
                                <Box display="flex" alignItems="center" marginBottom="20px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Nome da Fazenda:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {property.name}
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems="center" marginBottom="10px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Cidade:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {property.city}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Segunda Coluna */}
                            <Box display="flex" flexDirection="column" alignItems="flex-start">
                                <Box display="flex" alignItems="center" marginBottom="20px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Nome do Proprietário:
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
                                    {property.area} hectares
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
                                        <Tooltip title='Deletar'>
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
                                        </Tooltip>
                                        
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
                                                    color={colors.grey[100]}
                                                    backgroundColor={colors.primary[400]}
                                                    sx={{ 
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        width: 450,
                                                        borderRadius: 3, 
                                                        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
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
                                        <Tooltip title='Editar'>
                                            <Button 
                                                variant="contained" 
                                                onClick={() => handleEdit()} 
                                                sx={{ml:2,
                                                    backgroundColor:colors.orangeAccent[500],
                                                    "&:hover": {
                                                        backgroundColor: colors.grey[700], 
                                                    },
                                                }}

                                            >
                                                <EditIcon />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title='Convidar Usuário'>
                                            <Button 
                                                variant="contained" 
                                                onClick={() => handleInvite()} 
                                                sx={{ml:2,
                                                    backgroundColor:colors.blueAccent[500],
                                                    "&:hover": {
                                                        backgroundColor: colors.grey[700], 
                                                    },
                                                }}
                                            >
                                                <PersonAddAlt1Icon />
                                            </Button>
                                        </Tooltip>

                                        
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
                            backgroundColor={glebas.length === 0 ? "":colors.primary[400]}
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
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minHeight="475px" 
                            mt={isMobile ? "290px": "155px"}
                        >
                            <DataGrid
                                rows={users}
                                columns={columnsUsers}
                                sx={{mb:"20px"}}
                                localeText={{ noRowsLabel: <b>Nenhum usuário da propriedade foi encontrado.</b> }}
                            />
                        </Box>
                        <Box
                            gridColumn="span 12"
                            display="flex"
                            alignItems="center"  
                            justifyContent="left"  
                            height="50px"
                            mt={isMobile ? "620px": 60}
                        >                       
                            <Typography variant="h4" fontWeight="bold" color={colors.grey[100]}>
                                Itens em Estoque
                            </Typography>
                        </Box> 
                        <Box
                            gridColumn="span 12"
                            backgroundColor={glebas.length === 0 ? "":colors.primary[400]}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minHeight="475px"
                            mt={isMobile ? "540px": 49}
                            >
                            {storageItems.length === 0 ? (
                                <Box
                                    display="flex"
                                    flexDirection= "column"
                                    alignItems="center"  
                                    justifyContent="center"
                                    gap="20px"
                                >
                                    <Typography variant={isMobile ? "h6": "h5"} fontWeight="bold" color={colors.grey[100]}>
                                        Nenhum item de estoque na propriedade foi encontrado.
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
                                        {("Adicionar Item no estoque")}
                                    </Button>
                                </Box>
                            ) : (
                                <DataGrid
                                    rows={storageItems}
                                    sx={{mb:"20px"}}
                                    columns={columnsStorageItems}

                                />
                            )}
                        </Box>
                    </Box>
            </Box>
        </Box>
    );
};

export default Propertie;
