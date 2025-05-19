import React, { useState, useEffect, useCallback  } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import axios from "axios";
import { Box, Typography, useTheme, Button, useMediaQuery,Checkbox, FormControlLabel,Autocomplete,TextField, Modal, Backdrop, Fade, Chip,Tooltip,IconButton } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import { Formik,useFormikContext } from "formik";
import * as yup from "yup";

const StoragePage = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 1025px)");
    const isSmallDevice = useMediaQuery("(max-width: 800px)"); 
    const [owner, setOwner] = useState("");
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [propertyName, setPropertyName] = useState("");
    const [custo,setCusto] = useState("");
    const [openDelete, setOpenDelete] = useState(false);
    const [openTransfer, setOpenTransfer] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [safraOptions, setSafraOptions] = useState([]);
    const [glebaOptions, setGlebaOptions] = useState([]);
    const [storageQuantity, setStorageQuantity] = useState(""); 
    

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
            const fetchStorageData = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/storage-by-id`,{
                        params: { id: id }
                    });
                    setCusto(response.data);
                    setStorageQuantity(response.data.quantity)
                    setPropertyName(response.data.property.name);
                    const users = response.data.property.users;
                    const owner = users.find(custo => custo.user_properties.access === 'owner');
                    setOwner(owner);
                } catch (error) {
                    console.log(`ERROR - ao buscar dados do estoque de id = ${id}.`);
                    console.log(error);
                }
            };
            fetchStorageData();

            const fetchSafraData = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/safras-by-user`,{
                        params: { email: userData.email }
                    });
                    const safras = response.data
                    .filter(safra => safra.status === false)
                    .filter(safra => safra.type === "Realizado")
                    .map(safra => ({
                        id: safra.id,
                        name: `${safra.name} - ${safra.cultivo}`
                    }));
                    setSafraOptions(safras);
                } catch (error) {
                    console.log(`ERROR - ao buscar safras do usuário.`);
                    console.log(error);
                }
            };
            fetchSafraData();
        }
    }, [userData]);  

    
    const initialValues = {
        safra: "", 
        gleba: "",
        quantity: "",
        storageQuantity: storageQuantity
    };  

    const fetchGlebaData = useCallback(async (safraId) => {
        try {
          const response = await axios.get(`http://localhost:3000/glebas-by-safra`, {
            params: { id: safraId }
          });
          const glebaData = response.data.map(gleba => ({
            id: gleba.id,
            name: `${gleba.name} - ${gleba.property.name}`
          }));
          setGlebaOptions(response.data);
        } catch (error) {
          console.error('Erro ao buscar dados da safra:', error);
        }
    }, []);

    const navigate = useNavigate(); 

    const handleEdit = () => {
        navigate(`/estoque/edit/${id}`);
    }

    const handleOpenDelete = () => setOpenDelete(true);
    const handleCloseDelete = () => {
        setOpenDelete(false);
        setIsChecked(false);
    };

    const handleOpenTransfer = () => setOpenTransfer(true);
    const handleCloseTransfer = () => {
        setOpenTransfer(false);
        setIsChecked(false);
    };

    const handleDelete = async () =>{
        handleCloseDelete();
        try {
            const response = await axios.delete(`http://localhost:3000/storage`, {
                params: { id: id }
            });
            navigate(`/estoque?message=${encodeURIComponent("3")}`);
        } catch (error) {
            console.error("Erro ao deletar item de estoque:", error);
        }
    }

    const handleCheckboxChange = (event) => {
        setIsChecked(event.target.checked);
    };

    const handleChip = () => {
        //console.info('You clicked the Chip.');
    };  

    const handleFormSubmit = async (values) => {
        //console.log(values);
        try {
          const response = await axios.post(`http://localhost:3000/storage-custo`, {
            idStorageItem: id, 
            idSafra: values.safra, 
            idGleba: values.gleba,
            quantity: values.quantity,        
          });
      
          if (response.status === 201) {  
            navigate(`/estoque?message=${encodeURIComponent("4")}`);
          }
        } catch (error) {
          console.error("Erro ao transferir item estoque: " , error);
        }
    };

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Estoque" subtitle="Informações do item em estoque" />
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
                            backgroundColor={colors.primary[400]}
                            display="grid"
                            gridTemplateColumns={isMobile ? "1fr" : "repeat(2, 1fr)"} 
                            padding="25px 35px 30px 35px"
                            height={isMobile ? "auto" : "initial"} 
                            minHeight={isMobile ? "600px" : "240px"} 
                            marginBottom={isMobile ? "0" :"118px"}
                            marginTop={"-50px"}
                            sx={{boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",}}
                        >
                            {/* Primeira Coluna */}
                            <Box  gridColumn={isMobile ? "span 12" : "span 1"} display="flex" flexDirection="column" alignItems="flex-start" >
                                <Box display="flex" alignItems="center" marginBottom="15px" >
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Localização:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                        {propertyName + " - " + custo.storedLocation}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" marginBottom="15px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Categoria do item:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                        {custo.category}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" marginBottom="15px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Nome do item:
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
                            </Box>

                            {/* Segunda Coluna */}
                            <Box  gridColumn={isMobile ? "span 12" : "span 1"} display="flex" flexDirection="column" alignItems="flex-start">
                                <Box display="flex" alignItems="center" marginBottom="15px">
                                    <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                    Data de Validade:
                                    </Typography>
                                    <Typography variant="body1" color={colors.grey[300]}>
                                    {custo.expirationDate}
                                    </Typography>
                                </Box>
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
                                {userData &&  (
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
                                                    onClick={handleOpenDelete} 
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
                                                open={openDelete}
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
                                                <Fade in={openDelete}>
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
                                                            Deseja realmente deletar este item do estoque?
                                                        </Typography>
                                                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                                            Ao fazer isso, esteja ciente que:
                                                            <ul>
                                                                <li>Essa ação não pode ser revertida.</li>
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
                                                                onClick={handleCloseDelete} 
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
                                            <Tooltip title='Transferir'>
                                                <Button 
                                                    variant="contained" 
                                                    onClick={handleOpenTransfer} 
                                                    sx={{ ml:2,
                                                        backgroundColor:colors.blueAccent[500],
                                                        "&:hover": {
                                                            backgroundColor: colors.grey[700], 
                                                        },
                                                    }} 
                                                >
                                                    <ImportExportIcon />
                                                </Button>
                                            </Tooltip>
                                            <Modal
                                                open={openTransfer}
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
                                                <Fade in={openTransfer}>
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
                                                            Transferir item de estoque para safra
                                                        </Typography>
                                                        <Formik
                                                            onSubmit={handleFormSubmit}
                                                            initialValues={initialValues}
                                                            validationSchema={checkoutSchema}
                                                        >
                                                            {({
                                                                  values,
                                                                  errors,
                                                                  touched,
                                                                  handleBlur,
                                                                  handleChange,
                                                                  handleSubmit,
                                                                  setFieldValue
                                                            }) => (
                                                                  <form onSubmit={handleSubmit}>
                                                                    <Autocomplete
                                                                        disablePortal
                                                                        id="safra"
                                                                        options={safraOptions} 
                                                                        getOptionLabel={(option) => option.name || ""} 
                                                                        name="safra"
                                                                        value={
                                                                            values.safra 
                                                                            ? safraOptions.find((option) => option.id === values.safra) 
                                                                            : null
                                                                        } 
                                                                        onChange={(event, value) => {
                                                                            setFieldValue('safra', value?.id || null);
                                                                                    
                                                                            if (value) {
                                                                                fetchGlebaData(value.id); 
                                                                            }
                                                                        }}                      
                                                                        onBlur={handleBlur} 
                                                                        sx={{ 
                                                                            gridColumn: isSmallDevice ? "span 4" : "span 2",
                                                                            mt: 5 
                                                                        }}
                                                                        renderInput={(params) => (
                                                                            <TextField 
                                                                                {...params} 
                                                                                label="Safra"
                                                                                variant="filled"
                                                                                name="safra"
                                                                                error={!!touched.safra && !!errors.safra}
                                                                                helperText={touched.safra && errors.safra}
                                                                                onBlur={handleBlur} 
                                                                            />
                                                                        )}
                                                                    />
                                                                    <Autocomplete
                                                                        disablePortal
                                                                        id="gleba"
                                                                        options={glebaOptions} 
                                                                        getOptionLabel={(option) => option.name || ""} 
                                                                        name="gleba"
                                                                        value={
                                                                            values.gleba 
                                                                            ? glebaOptions.find((option) => option.id === values.gleba) 
                                                                            : null
                                                                        } 
                                                                        onChange={(event, value) => setFieldValue('gleba', value?.id || null)} 
                                                                        onBlur={handleBlur} 
                                                                        sx={{ 
                                                                            gridColumn: isSmallDevice ? "span 4" : "span 2", 
                                                                            mt: 5
                                                                        }}
                                                                        renderInput={(params) => (
                                                                            <TextField 
                                                                                {...params} 
                                                                                label="Gleba"
                                                                                variant="filled"
                                                                                name="gleba"
                                                                                error={!!touched.gleba && !!errors.gleba}
                                                                                helperText={touched.gleba && errors.gleba}
                                                                                onBlur={handleBlur} 
                                                                            />
                                                                        )}
                                                                        noOptionsText="Nenhuma Gleba Disponível"
                                                                    />   
                                                                    <TextField
                                                                        id="quantity"  
                                                                        label="Quantidade"
                                                                        type="number"  
                                                                        name="quantity"  
                                                                        value={values.quantity}  
                                                                        onChange={handleChange}  
                                                                        onBlur={handleBlur}  
                                                                        error={!!touched.quantity && !!errors.quantity} 
                                                                        helperText={touched.quantity && errors.quantity}  
                                                                        variant="filled"
                                                                        fullWidth
                                                                        sx={{ 
                                                                            mt: 5
                                                                        }}
                                                                    />      
                                                                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                                                        Deseja realmente transferir este item do estoque para um custo da safra?
                                                                        Ao fazer isso, esteja ciente que:
                                                                        <ul>
                                                                            <li>Essa ação não pode ser revertida.</li>
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
                                                                            onClick={handleCloseTransfer} 
                                                                            sx={{
                                                                                color: colors.redAccent[500]
                                                                            }}
                                                                        >
                                                                            Cancelar
                                                                        </Button>
                                                                        <Button 
                                                                            type="submit"
                                                                            variant="contained" 
                                                                            sx={{ backgroundColor:  colors.blueAccent[500],
                                                                                "&:hover": {
                                                                                    backgroundColor: colors.grey[700], 
                                                                                },
                                                                            }}
                                                                            disabled={!isChecked} 
                                                                        >
                                                                            Transferir
                                                                        </Button>
                                                                    </Box>                                               
                                                                  </form>
                                                                )}
                                                        </Formik>
 
                                                        
                                                    </Box>
                                                </Fade>
                                            </Modal>
                                        </Box>
                                    )}
                            </Box>
                        </Box>
                    </Box>
            </Box>
        </Box>
    );
};

const checkoutSchema = yup.object().shape({
    quantity: yup
        .number()
        .required("Campo de preenchimento obrigatório")
        .positive("Deve ser um número positivo")
        .test(
        'quantity-greater-than-custo', 
        'A quantidade não pode ser maior que o disponível em estoque', 
        function(value) {
            const { storageQuantity } = this.parent; 
            return value <= storageQuantity;  
        }
    ),    
    safra: yup.string().required("Campo de preenchimento obrigatório"),
    gleba: yup.string().required("Campo de preenchimento obrigatório"),    
});

export default StoragePage;
