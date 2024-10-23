import React, { useState, useEffect } from "react";
import axios from "axios";
import secureLocalStorage from 'react-secure-storage';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Box, Typography, useTheme, Button, useMediaQuery,IconButton, Tooltip,Modal, Backdrop, Fade,FormControlLabel,Checkbox  } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { mockDataInvites } from "../../data/mockData";
import DeleteIcon from '@mui/icons-material/Delete';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';

const Invite = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const [userData, setUserData] = useState(null);
    const [invites, setInvites] = useState([]);
    const { id } = useParams(); 
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const message = Number(query.get('message'));
    const [openSnackbar, setOpenSnackbar] = useState(!!message);
    const [snackbarMessage, setSnackbarMessage] = useState(""); 
    const [open, setOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const columns=[
        { field: 'remetente', headerName: 'Remetente', flex: 1,resizable: false, headerAlign: "left"},
        { field: 'emailRemetente', headerName: 'E-mail Remetente', flex: 1 , resizable: false, headerAlign: "left"},
        { field: 'propertyName', headerName: 'Nome da Propriedade', flex: 1, resizable: false, headerAlign: "left" },
        { field: 'city', headerName: 'Cidade', flex: 1,resizable: false, headerAlign: "left"},
        {
            field: 'actions',
            headerName: 'Ações',
            headerAlign: "center",
            flex: 1,
            renderCell: (params) => (
                <Box
                    display="flex" 
                    justifyContent="center" 
                    width="100%"
                    m="10px auto"
                >
                    {isMobile ? (
                        <>
                            <Tooltip title="Aceitar">
                                <IconButton onClick={() => handleAccept(params.row.id)} sx={{ color: colors.blueAccent[500] }}>
                                    <DoneIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Recusar">
                                <IconButton onClick={() => handleDecline(params.row.id)} sx={{ color: colors.redAccent[500] }}>
                                    <ClearIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : (
                        <>
                            <Tooltip title="Aceitar">
                                <Button
                                        variant="contained" 
                                        onClick={() => handleAccept(params.row.id)}
                                        sx={{ marginRight: "10px",
                                            backgroundColor:  colors.blueAccent[500],
                                            "&:hover": {
                                                backgroundColor: colors.grey[700], 
                                            },
                                        }} 
                                    >
                                    <DoneIcon />
                                </Button>
                            </Tooltip>
                            <Tooltip title="Recusar">
                                <Button
                                    variant="contained" 
                                    onClick={handleOpen} 
                                    sx={{ backgroundColor:  colors.redAccent[500],
                                        "&:hover": {
                                            backgroundColor: colors.grey[700], 
                                        },
                                    }} 
                                >
                                    <ClearIcon/>
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
                                        sx: {
                                            backgroundColor: 'rgba(0, 0, 0, 0.05)',} // Alterando a cor do background do Backdrop
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
                                        p: 4,
                                    }}
                                >
                                    <Typography id="modal-modal-title" variant="h4" component="h2">
                                        Deseja realmente recusar esse convite?
                                    </Typography>
                                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                        Ao fazer isso, esteja ciente que essa ação não pode ser revertida!
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
                        </>
                        

                    )}
                    
                </Box>
            )
        },
    ];

    useEffect(() => {
        const storedUser = secureLocalStorage.getItem('userData'); 
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
    }, []);

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
/*
    useEffect(() => {
        if (userData) { 
            const fetchInvites = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/invites/${id}`);
                    setInvites(response.data.invites); // Supondo que a resposta contenha uma lista de convites
                } catch (error) {
                    console.log("ERROR - ao buscar convites.");
                }
            };
            fetchInvites();
        }
    }, [userData, id]);  */

    const navigate = useNavigate(); 

    const handleAccept = (inviteId) => {
        // Lógica para aceitar o convite
        console.log("Convite aceito:", inviteId);
    };

    const handleDecline = (inviteId) => {
        // Lógica para recusar o convite
        console.log("Convite recusado:", inviteId);
    };

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Convites" subtitle="Convites para propriedades" />
                <Box>
                    <Tooltip title={isMobile ? "Enviar Convite": ""}>
                        <Button 
                            sx={{
                                backgroundColor: colors.mygreen[400],
                                color: colors.grey[100],
                                fontSize: "14px",
                                fontWeight: "bold",
                                padding: "10px 20px",
                            }}
                            onClick={() => navigate(``)}
                        >
                            <PersonAddAlt1Icon sx={{ mr: isMobile ? "0px" : "10px" }} />
                            {!isMobile && ("Enviar Convite")}
                        </Button>
                    </Tooltip>
                    
                </Box>
            </Box>

            <Box m="20px 0" height="75vh" maxWidth="1600px" mx="auto"
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
                }}
                >
                    {mockDataInvites.length === 0 ? (
                        <Box
                            display="flex"
                            flexDirection= "column"
                            alignItems="center"  
                            justifyContent="center"
                            gap="20px"
                            mt="50px"
                        >
                            <Typography variant={isMobile ? "h6": "h5"} fontWeight="bold" color={colors.grey[100]}>
                                Nenhum convite pendente.
                            </Typography>
                        </Box>
                ) : (
                    <DataGrid
                        rows={mockDataInvites}
                        columns ={columns}
                        localeText={{ noRowsLabel: <b>Nenhum convite encontrado.</b> }}
                        initialState={{
                            ...mockDataInvites.initialState,
                            pagination: { paginationModel: { pageSize: 15 } },
                          }}
                          pageSizeOptions={[15, 20, 30]}
                    />
                )}
            </Box>
            <div>
                {message !== 0  && (
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

export default Invite;
