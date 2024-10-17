import React, { useState, useEffect } from "react";
import { useNavigate,useParams } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import axios from "axios";
import { Box, Typography, useTheme, Button, useMediaQuery,Checkbox, FormControlLabel, Modal, Backdrop, Fade } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataUsers, mockDataGlebas } from "../../data/mockData";
import Header from "../../components/Header";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const Gleba = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 800px)");
    const [owner, setOwner] = useState("");
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [propriedade, setPropriedade] = useState("");
    const [gleba, setGleba] = useState("");
    const [safrasPlanejadas,setSafrasPlanejadas] = useState([]);
    const [safrasRealizadas,setSafrasRealizadas] = useState([]);
    const [open, setOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(false);


    const columnsSafras = [
        { field: "cultivo", headerName: "Cultivo", flex: 1, cellClassName: "city-column--cell", resizable: false },
        { field: "semente", headerName: "Semente", type: "number", headerAlign: "left", align: "left", flex: 1,resizable: false },
        { field: "dataFimPlantio", headerName: "Fim Plantio", type: "number", headerAlign: "left", align: "left", flex: 1, resizable: false },
        { field: "dataFimColheita", headerName: "Fim Colheita", type: "number", headerAlign: "left", align: "left", flex: 1, resizable: false },
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
                        <Button 
                            variant="contained" 
                            sx={{ backgroundColor: colors.greenAccent[500],
                                "&:hover": {
                                    backgroundColor: colors.grey[700], 
                                },
                             }} 
                            onClick={() => handleView(params.row)}
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
            const fetchGlebas = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/gleba/${id}`);
                    const { gleba, propriedade, owner } = response.data;
                    setGleba(gleba);
                    setPropriedade(propriedade);
                    setOwner(owner);
                } catch (error) {
                    console.log("ERROR - ao buscar a gleba.");
                }
            };
            fetchGlebas();
        }
    }, [userData]);  

    const navigate = useNavigate(); 

    const handleEdit = () => {
        navigate(`/glebas/edit/${id}`);
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
            <Header title="Gleba" subtitle="Informações da gleba" />
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
                            minHeight={isMobile ? "260px" : "auto"} 
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
                                    {gleba.area}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" marginBottom={isMobile ? "15px" : "0px"}>
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Nome do Dono:
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

                                <Box display="flex" alignItems="center" marginBottom={isMobile ? "15px": "0px"}>
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Cidade:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {propriedade.city}
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
                                    </Box>
                                )}
                                
                            </Box>   
                        </Box>
                        {/*Tabelas*/}
                        <Box
                            gridColumn="span 12"
                            display="flex"
                            alignItems="center"  
                            justifyContent="left"  
                            height="50px"
                            mt={isMobile ? "120px": "0px"}
                        >
                            <Typography variant="h4" fontWeight="bold" color={colors.grey[100]}>
                                Safras Planejadas
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
                            {safrasPlanejadas.length === 0 ? (
                                <Box
                                    display="flex"
                                    flexDirection= "column"
                                    alignItems="center"  
                                    justifyContent="center"
                                    gap="20px"
                                >
                                    <Typography variant={isMobile ? "h6": "h5"} fontWeight="bold" color={colors.grey[100]}>
                                        Nenhuma safra planejada da gleba foi encontrada.
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
                                        {("Adicionar Safra")}
                                    </Button>
                                </Box>
                            ):(
                                
                                <DataGrid
                                    rows={mockDataGlebas}
                                    columns={columnsSafras}
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
                                Safras Realizadas
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
                            mb="10000px"
                        >
                            {safrasPlanejadas.length === 0 ? (
                                <Box
                                    display="flex"
                                    flexDirection= "column"
                                    alignItems="center"  
                                    justifyContent="center"
                                    gap="20px"
                                >
                                    <Typography variant={isMobile ? "h6": "h5"} fontWeight="bold" color={colors.grey[100]}>
                                        Nenhuma safra planejada da gleba foi encontrada.
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
                                        {("Adicionar Safra")}
                                    </Button>
                                </Box>
                            ):(
                                <DataGrid
                                    rows={mockDataGlebas}
                                    columns={columnsSafras}
                                    sx={{mb:"20px"}}
                                />
                            )}
                        </Box>
                    </Box>
            </Box>
        </Box>
    );
};

export default Gleba;
