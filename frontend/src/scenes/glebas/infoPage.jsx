import React, { useState, useEffect } from "react";
import { useNavigate,useParams } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import axios from "axios";
import { Box, Typography, useTheme, Button, useMediaQuery,Checkbox,FormControlLabel,Modal,Backdrop,Fade,Tooltip,IconButton} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const Gleba = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 800px)");
    const [owner, setOwner] = useState([]);
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [propriedade, setPropriedade] = useState("");
    const [safra, setSafra] = useState("")
    const [gleba, setGleba] = useState("");

    const [open, setOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

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
                    const response = await axios.get(`http://localhost:3000/glebas/${id}`);
                    const gleba = response.data;
                    const safras = gleba.safras.length !== 0  ? gleba.safras[0].name + " - " + gleba.safras[0].crop : "";  
                    setSafra(safras); 
                    setGleba(gleba);
                    setPropriedade(gleba.property);
                    const users = gleba.property.users
                    const owner = users.filter(user => user.user_properties.access == 'owner');
                    setOwner(owner[0]);
                    

                } catch (error) {
                    console.log(`ERROR - ao buscar a gleba de id = ${id} .`);
                    console.log(error);
                }
            };
            fetchGlebas();
        }
    }, [userData]);  

    const navigate = useNavigate(); 

    const handleEdit = () => {
        navigate(`/glebas/edit/${id}`);
    }

    const handleView = (id) => {
        navigate(`/safras/${id}`);
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setIsChecked(false);
    };

    const handleDelete = async () =>{
        handleClose();
        try {
            const response = await axios.delete(`http://localhost:3000/glebas`, {
                params: { id: id }
            });
            navigate(`/glebas?message=${encodeURIComponent("3")}`);
        } catch (error) {
                    console.error("Erro ao deletar gleba:", error);
        }
    }

    const handleCheckboxChange = (event) => {
        setIsChecked(event.target.checked);
    };


    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Gleba" subtitle="Informações da gleba" />
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
                            minHeight={isMobile ? "400px" : "200px"} 
                            sx={{boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",}}
                        >
                            
                            <Box display="flex" flexDirection="column" alignItems="flex-start">
                                <Box display="flex" alignItems="center" marginBottom="15px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Nome da Gleba:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {gleba.name}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" marginBottom="15px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Área:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {gleba.area + " hectares"}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" marginBottom={isMobile ? "15px" : "0px"}>
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Nome do Proprietário:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                        {owner.name}
                                    </Typography>
                                </Box>
                                
                            </Box>

                            {/* Segunda Coluna */}
                            <Box display="flex" flexDirection="column" alignItems="flex-start">
                                <Box display="flex" alignItems="center" marginBottom="15px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Nome da Fazenda:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {propriedade.name}
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems="center" marginBottom="15px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Cidade:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                        {propriedade.city}
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems="center" marginBottom={isMobile ? "15px": "0px"}>
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Safra atual:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                        {safra}
                                    </Typography>
                                </Box>
                                {userData && owner && userData.email === owner.email &&  (
                                    <Box 
                                        display="flex" 
                                        justifyContent="flex-end" 
                                        alignItems="flex-end" 
                                        flexGrow={1} 
                                        width="100%"
                                        marginTop={isMobile ?"20px": "-30px"}
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
                                                        Deseja realmente deletar esta gleba?
                                                    </Typography>
                                                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                                        Ao fazer isso, esteja ciente que:
                                                        <ul>
                                                            <li>Essa ação não pode ser revertida;</li>
                                                            <li>Ao deletar a gleba, ela será removida da safra correspondente.</li>
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
                                    </Box>
                                )}
                                
                            </Box>   
                        </Box>
                        {/*Tabelas*/}
                        
                    </Box>
            </Box>
        </Box>
    );
};

export default Gleba;
