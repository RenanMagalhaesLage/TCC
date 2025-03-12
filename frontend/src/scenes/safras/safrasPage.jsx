import React, { useState, useEffect } from "react";
import { useNavigate,useParams } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import axios from "axios";
import { Box, Typography, useTheme, Button, useMediaQuery,Checkbox, FormControlLabel, Modal, Backdrop, Fade, Chip,Tooltip,IconButton } from "@mui/material";
import { DataGrid,GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector } from '@mui/x-data-grid';
import { tokens } from "../../theme";
import Header from "../../components/Header";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DoneIcon from '@mui/icons-material/Done';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import VisibilityIcon from '@mui/icons-material/Visibility';


const SafrasPage = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const isSmallDivice = useMediaQuery("(max-width: 1300px)");
    const [owner, setOwner] = useState("");
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [propriedade, setPropriedade] = useState("");
    const [safra, setSafra] = useState("");
    const [glebas, setGlebas] = useState([]);
    const [custosRealizados,setCustosRealizados] = useState([]);
    const [custosPlanejados,setCustosPlanejados] = useState([]);
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

    const columns = [
        { field: "category", headerName: "Categoria", flex: 1, minWidth: 80, resizable: false },
        { field: "name", headerName: "Nome", flex: 1, minWidth: 80, resizable: false },
        { field: "unit", headerName: "Unidade", flex: 1, resizable: false },
        { field: "quantity", headerName: "Quantidade", flex: 1, resizable: false },
        { field: "price", headerName: "Preço", flex: 1,  resizable: false },
        { field: "total_value", headerName: "Valor Total", flex: 1,  resizable: false },
        { field: "date", headerName: "Data", flex: 1, resizable: false },
        { field: "note", headerName: "Observação", flex: 1, minWidth: 80, resizable: false },
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
            const fetchSafras = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/safras/${id}`);
                    const safra = response.data;
                    const glebas = response.data.glebas;
                    const custos = response.data.custos;
                    
                    setSafra(safra);
                    setGlebas(glebas); 

                    const custosPlanejados = custos.filter(custo => custo.type === 'Planejado');
                    const custosRealizados = custos.filter(custo => custo.type === 'Realizado');
                    setCustosPlanejados(custosPlanejados);
                    setCustosRealizados(custosRealizados);

                    setOwner(glebas[0].property.users[0].name);
                    setIsHigher(safra.prodRealizada >= safra.prodPrevista);
                } catch (error) {
                    console.log(`ERROR - ao buscar a safra de id = ${id}`);
                    console.log(error);
                }
            };
            fetchSafras();
        }
    }, [userData]);  

    useEffect(() => {
        //console.log(custos); 
    }, [custosPlanejados, custosRealizados]);

    const navigate = useNavigate(); 

    const handleEdit = () => {
        navigate(`/safras/edit/${id}`);
    }

    const handleView = (id) => {
        navigate(`/custos/${id}`);
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setIsChecked(false);
    };

    const handleDelete = async () =>{
        handleClose();
        try {
            const response = await axios.delete(`http://localhost:3000/safras/${id}`, {
                answer: false, 
            });
            navigate(`/safras?message=${encodeURIComponent("3")}`);
        } catch (error) {
            console.error("Erro ao deletar safra:", error);
        }
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
                                    Nome do Proprietário:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {owner}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" >
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Área da Safra:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Segunda Coluna */}
                            <Box display="flex" flexDirection="column" alignItems="flex-start">
                                <Box display="flex" alignItems="center" marginBottom="15px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                        Glebas:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                        {glebas.slice(0, 5).map((gleba, index) => (
                                        <span key={index}>
                                            {gleba.name}{index < glebas.slice(0, 5).length - 1 && ', '}
                                        </span>
                                        ))}
                                        {glebas.length > 5 && '...'}
                                    </Typography>
                                </Box>
                            </Box>   
                        </Box>

                        <Box
                            gridColumn="span 12"
                            backgroundColor={colors.primary[400]}
                            display="grid"
                            gridTemplateColumns={"repeat(2, 1fr)"} 
                            padding="25px 35px 30px 35px"
                            height={isMobile ? "auto" : "initial"} 
                            minHeight={isMobile ? "900px" : "550px"} 
                            marginBottom={isMobile ?"0px" :"80px"}
                            marginTop={isMobile ? "10px":"-110px"}
                            sx={{boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",}}
                        >
                            {/* Primeira Coluna */}
                            <Box display="flex" flexDirection="column" alignItems="flex-start" >
                                {headerNames.slice(0, Math.ceil(headerNames.length / 2)).map((headerName, index) => (
                                        <Box display="flex" alignItems={isMobile ? "flex-start":"center" } marginBottom="15px" flexDirection={isMobile ? "column":"row" } key={index}>
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
                            <Box display="flex" flexDirection="column" alignItems="flex-start" >
                                {headerNames.slice(Math.ceil(headerNames.length / 2)).map((headerName, index) => (
                                    <Box display="flex" alignItems={isMobile ? "flex-start":"center" } marginBottom="15px" flexDirection={isMobile ? "column":"row" } key={index + Math.ceil(headerNames.length / 2)}>
                                        <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                            {headerName}:
                                        </Typography>
                                        <Typography variant="body1" color={colors.grey[300]}>
                                            {safra[fieldNames[index+8]]} 
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>  
                            {/* Linha de baixo */} 
                            <Box
                                gridColumn="span 12"
                                display="grid"
                                gridTemplateColumns={isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)"}
                                gap="15px"
                            >
                                <Box display="flex" alignItems={isMobile ? "flex-start":"center" } marginBottom="15px" flexDirection={isMobile ? "column":"row" }>
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginBottom="5px" marginRight="10px">
                                        Prod. Prevista:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                        {safra.prodPrevista}
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems={isMobile ? "flex-start":"center" } marginBottom="15px" flexDirection={isMobile ? "column":"row" }>
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginBottom="5px" marginRight="10px">
                                    Prod. Realizada:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                        {safra.prodRealizada}
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems={"center" } marginBottom="15px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginBottom="5px" marginRight="10px">
                                    Comparativo:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    <Box
                                        width="100%"
                                        p="5px"
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                        backgroundColor={isHigher ? colors.mygreen[500] : colors.redAccent[500]} 
                                        borderRadius="4px"
                                        color={"#fff" }
                                    >
                                        {isHigher ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />} 
                                    </Box>
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems={isMobile ? "flex-start":"center" } marginBottom="15px" flexDirection={isMobile ? "column":"row" }>
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginBottom="5px" marginRight="10px">
                                    Porcentagem / HA:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                        {safra.porcentHect}
                                    </Typography>
                                </Box>
                                
                            </Box>
                            <Box
                                gridColumn="span 12"
                                display="grid"
                                alignItems="flex-end"
                                justifyContent="flex-end"
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
                                        <Tooltip title='Finalizar Safra'>
                                            <Button 
                                                variant="contained" 
                                                onClick={() => handleFinalize()} 
                                                sx={{ml:2,
                                                    backgroundColor:colors.blueAccent[500],
                                                    "&:hover": {
                                                        backgroundColor: colors.grey[700], 
                                                    },
                                                }}
                                            >
                                                <DoneAllIcon />
                                            </Button>
                                        </Tooltip>
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
                                Custos Planejados da Safra
                            </Typography>
                        </Box>
                        <Box
                            gridColumn="span 12"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minHeight="475px"
                            mt={isMobile ? "670px": "205px"}
                        >
                            {custosPlanejados.length === 0 ? (
                                <Box
                                    display="flex"
                                    flexDirection= "column"
                                    alignItems="center"  
                                    justifyContent="center"
                                    gap="20px"
                                >
                                    <Typography variant={isMobile ? "h6": "h5"} fontWeight="bold" color={colors.grey[100]}>
                                        Nenhum custo planejado da safra foi encontrado.
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
                                    rows={custosPlanejados}
                                    columns={columns}
                                    sx={{mb:"20px"}}
                                    slots={{ toolbar: CustomToolbar }}
                                />
                            )}
                        </Box>

                        <Box
                            gridColumn="span 12"
                            display="flex"
                            alignItems="center"  
                            justifyContent="left"  
                            height="50px"
                            mt={isMobile ? "990px": "530px"}
                        >
                            <Typography variant="h4" fontWeight="bold" color={colors.grey[100]}>
                                Custos Realizados da Safra
                            </Typography>
                        </Box>
                        <Box
                            gridColumn="span 12"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minHeight="475px"
                            mt={isMobile ? "895px": "440px"}
                        >
                            {custosRealizados.length === 0 ? (
                                <Box
                                    display="flex"
                                    flexDirection= "column"
                                    alignItems="center"  
                                    justifyContent="center"
                                    gap="20px"
                                >
                                    <Typography variant={isMobile ? "h6": "h5"} fontWeight="bold" color={colors.grey[100]}>
                                        Nenhum custo realizado da safra foi encontrado.
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
                                    rows={custosRealizados}
                                    columns={columns}
                                    sx={{mb:"20px"}}
                                    slots={{ toolbar: CustomToolbar }}
                                />
                            )}
                        </Box>
                    </Box>
            </Box>
        </Box>
    );
};


function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton /> {/* Botão de exibição de colunas */}
        <GridToolbarFilterButton />  {/* Botão de filtro */}
        <GridToolbarDensitySelector /> {/* Seletor de densidade */}
      </GridToolbarContainer>
    );
}

export default SafrasPage;
