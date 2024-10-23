import React, { useState, useEffect } from "react";
import { useNavigate,useParams } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import axios from "axios";
import { Box, Typography, useTheme, Button, useMediaQuery,Checkbox, FormControlLabel, Modal, Backdrop, Fade, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataSafra, mockDataGlebas } from "../../data/mockData";
import Header from "../../components/Header";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DoneIcon from '@mui/icons-material/Done';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import DoneAllIcon from '@mui/icons-material/DoneAll';


const Safra = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const [owner, setOwner] = useState("");
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [propriedade, setPropriedade] = useState("");
    const [safra, setSafra] = useState("");
    const [gleba, setGleba] = useState("");
    const [custos,setCustos] = useState([]);
    const [open, setOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const headerNames = [
        "Cultivo",
        "Semente",
        "Metro Linear",
        "Dosagem",
        "Toneladas",
        "Adubo",
        "Fim Plantio",
        "Fim Colheita",
        "Tempo Lavoura",
        "Preção Milimetrica",
        "Umidade",
        "Impureza",
        "Grãos Avariados",
        "Grãos Esverdeados",
        "Grãos Quebrados",
        "Prod. Total",
        "Prod. Prevista",
        "Prod. Realizada",
        "Comparativo",
        "Porcentagem / HA",
    ];

    const fieldNames = [
        "cultivo",
        "semente",
        "metroLinear",
        "dosagem",
        "toneladas",
        "adubo",
        "dataFimPlantio",
        "dataFimColheita",
        "tempoLavoura",
        "precMilimetrica",
        "umidade",
        "impureza",
        "graosAvariados",
        "graosEsverdeados",
        "graosQuebrados",
        "prodTotal",
        "prodPrevista",
        "prodRealizada",
        "comparativo",
        "porcentHect",
        "actions"
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
                    const response = await axios.get(`http://localhost:3000/safra/${id}`);
                    const {safra, gleba, property, owner } = response.data;
                    setSafra(safra)
                    setGleba(gleba);
                    setPropriedade(property);
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
        navigate(`/safras/edit/${id}`);
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

    const handleChip = () => {
        //console.info('You clicked the Chip.');
    };  


    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Safra" subtitle="Informações da safra" />
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
                            display="grid"
                            gridTemplateColumns={isMobile ? "1fr" : "repeat(2, 1fr)"}
                            padding="25px 0px"
                            marginTop={"-60px"}
                        >
                            <Box display="flex" flexWrap="wrap" gap="10px"> 
                                <Chip
                                    label={safra.status ? "Finalizada" : "Em Andamento"}
                                    deleteIcon={safra.status ? <DoneIcon /> : <HourglassBottomIcon/>}
                                    onClick={handleChip}
                                    onDelete={handleChip}
                                    sx={{ padding: "10px", fontWeight: "bold", flexShrink: 0 }} 
                                />
                                <Chip
                                    label={safra.type}
                                    deleteIcon={safra.type === "Planejado" ? <DoneIcon /> : <DoneAllIcon/>}
                                    onClick={handleChip}
                                    onDelete={handleChip}
                                    sx={{ padding: "10px", fontWeight: "bold", flexShrink: 0 }} 
                                />
                            </Box>
                        </Box>
                        
                        <Box
                            gridColumn="span 12"
                            backgroundColor={colors.primary[400]}
                            display="grid"
                            gridTemplateColumns={isMobile ? "1fr" : "repeat(2, 1fr)"} 
                            padding="25px 35px 30px 35px"
                            height={isMobile ? "auto" : "initial"} 
                            minHeight={isMobile ? "220px" : "auto"} 
                            marginBottom={isMobile ? "0px" :"118px"}
                            marginTop={"-130px"}
                            sx={{boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",}}
                        >
                            {/* Primeira Coluna */}
                            <Box display="flex" flexDirection="column" alignItems="flex-start" >
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
                                <Box display="flex" alignItems="center" marginBottom="15px">
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
                                <Box display="flex" alignItems="center" marginBottom="15px" >
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Nome da Gleba:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {gleba.name}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" >
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Área da Gleba:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {gleba.area}
                                    </Typography>
                                </Box>
                            </Box>   
                        </Box>

                        <Box
                            gridColumn="span 12"
                            backgroundColor={colors.primary[400]}
                            display="grid"
                            gridTemplateColumns={isMobile ? "1fr" : "repeat(2, 1fr)"} 
                            padding="25px 35px 30px 35px"
                            height={isMobile ? "auto" : "initial"} 
                            minHeight={isMobile ? "900px" : "550px"} 
                            marginBottom={isMobile ?"0px" :"80px"}
                            marginTop={isMobile ? "10px":"-110px"}
                            sx={{boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",}}
                        >
                            {/* Primeira Coluna */}
                            <Box display="flex" flexDirection="column" alignItems="flex-start">
                                {headerNames.slice(0, Math.ceil(headerNames.length / 2)).map((headerName, index) => (
                                        <Box display="flex" alignItems="center" marginBottom="15px" key={index}>
                                            <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                                {headerName}:
                                            </Typography>
                                            <Typography variant="body1" color={colors.grey[300]}>
                                                {safra[fieldNames[index]]} 
                                            </Typography>
                                        </Box>
                                ))}
                                
                            </Box>

                            {/* Segunda Coluna */}
                            <Box display="flex" flexDirection="column" alignItems="flex-start">
                                {headerNames.slice(Math.ceil(headerNames.length / 2)).map((headerName, index) => (
                                    <Box display="flex" alignItems="center" marginBottom="15px" key={index + Math.ceil(headerNames.length / 2)}>
                                        <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                            {headerName}:
                                        </Typography>
                                        <Typography variant="body1" color={colors.grey[300]}>
                                        {safra[fieldNames[index+10]]} 
                                        </Typography>
                                    </Box>
                                ))}
                                {userData && owner && userData.email === owner.email &&  (
                                    <Box 
                                        display="flex" 
                                        justifyContent= {isMobile ? "flex-start" : "flex-end"} 
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
                                                        Deseja realmente deletar esta safra?
                                                    </Typography>
                                                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                                        Ao fazer isso, esteja ciente que:
                                                        <ul>
                                                            <li>Essa ação não pode ser revertida;</li>
                                                            <li>Ao deletar a safra, os custos correspondentes também serão apagados.</li>
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
                            mt={isMobile ? "770px": "300px"}
                        >
                            <Typography variant="h4" fontWeight="bold" color={colors.grey[100]}>
                                Custos da Safra
                            </Typography>
                        </Box>
                        <Box
                            gridColumn="span 12"
                            backgroundColor={colors.primary[400]}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minHeight="475px"
                            mt={isMobile ? "670px": "205px"}
                            sx={{boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",}}
                        >
                            {custos.length === 0 ? (
                                <Box
                                    display="flex"
                                    flexDirection= "column"
                                    alignItems="center"  
                                    justifyContent="center"
                                    gap="20px"
                                >
                                    <Typography variant={isMobile ? "h6": "h5"} fontWeight="bold" color={colors.grey[100]}>
                                        Nenhum custo da safra foi encontrado.
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
                                        {("Adicionar Custo")}
                                    </Button>
                                </Box>
                            ):(
                                
                                <DataGrid
                                    rows={mockDataGlebas}
                                    columns={columnsSafras}
                                />
                            )}
                        </Box>
                    </Box>
            </Box>
        </Box>
    );
};

export default Safra;
