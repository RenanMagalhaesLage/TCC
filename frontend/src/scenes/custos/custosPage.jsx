import React, { useState, useEffect } from "react";
import { useNavigate,useParams } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import axios from "axios";
import { Box, Typography, useTheme, Button, useMediaQuery,Checkbox, FormControlLabel, Modal, Backdrop, Fade, Chip,Tooltip,IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataSafra, mockDataGlebas } from "../../data/mockData";
import Header from "../../components/Header";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DoneIcon from '@mui/icons-material/Done';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const CustosPage = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const [owner, setOwner] = useState("");
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [propriedade, setPropriedade] = useState("");
    const [safra, setSafra] = useState("");
    const [gleba, setGleba] = useState("");
    const [custo,setCusto] = useState("");
    const [open, setOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [isHigher, setIsHigher] = useState(false)

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
    ];

    const comparativoProd = [
        "Prod. Prevista",
        "Prod. Realizada",
        "Comparativo",
        "Porcentagem / HA",
    ]

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
                    const response = await axios.get(`http://localhost:3000/custos/${id}`);
                    const {custo, safra, gleba, property, owner } = response.data;
                    setCusto(custo);
                    setSafra(safra);
                    setGleba(gleba);
                    setPropriedade(property);
                    setOwner(owner);
                } catch (error) {
                    console.log("ERROR - ao buscar dados do custo.");
                }
            };
            fetchCustosData();
        }
    }, [userData]);  

    const navigate = useNavigate(); 

    const handleEdit = () => {
        navigate(`/custos/edit/${id}`);
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

    const handleFinalize = () => {
        
    }


    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Custo" subtitle="Informações do custo" />
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
                        paddingBottom="300px"
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
                                    label={custo.type}
                                    deleteIcon={custo.type === "Planejado" ? <DoneIcon /> : <DoneAllIcon/>}
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
                                <Box display="flex" alignItems="center"  marginBottom="15px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Área da Gleba:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {gleba.area}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" >
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Safra:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {safra.cultivo + " - " + safra.dataFimPlantio}
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
                            minHeight={isMobile ? "400px" : "240px"} 
                            marginBottom={isMobile ? "0" :"118px"}
                            marginTop={isMobile ? "10px":"-110px"}
                            sx={{boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",}}
                        >
                            {/* Primeira Coluna */}
                            <Box  gridColumn={isMobile ? "span 12" : "span 1"} display="flex" flexDirection="column" alignItems="flex-start" >
                                <Box display="flex" alignItems="center" marginBottom="15px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Categoria do Custo:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {custo.category}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" marginBottom="15px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Nome do Custo:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {custo.name}
                                    </Typography>
                                </Box>  
                                <Box display="flex" alignItems="center" marginBottom="15px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Unidade:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {custo.unit}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" marginBottom="15px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Data:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {custo.date}
                                    </Typography>
                                </Box>
                                
                            </Box>

                            {/* Segunda Coluna */}
                            <Box  gridColumn={isMobile ? "span 12" : "span 1"} display="flex" flexDirection="column" alignItems="flex-start">
                                <Box display="flex" alignItems="center" marginBottom="15px" >
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Quantidade:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {custo.quantity}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center"  marginBottom="15px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Preço:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {custo.price}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" >
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Valor Total:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {custo.totalValue}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box gridColumn="span 12" flexDirection="column" alignItems="flex-start" marginTop={isMobile ? "15px" : "0px"}>
                                <Box display="flex" alignItems="center">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Observações:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {custo.note}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box
                                gridColumn="span 12"
                                display="grid"
                                alignItems="flex-end"
                                justifyContent="flex-end"
                                //sx={{border: "1px solid red"}} 
                            >
                                {userData && owner && userData.email === owner.email &&  (
                                        <Box 
                                            display="flex" 
                                            justifyContent= {isMobile ? "flex-start" : "flex-end"} 
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
                    </Box>
            </Box>
        </Box>
    );
};

export default CustosPage;
