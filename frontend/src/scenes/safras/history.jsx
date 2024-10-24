import { Box, Typography, useTheme, Button, useMediaQuery  } from "@mui/material";
import { DataGrid,GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useNavigate,useLocation } from 'react-router-dom';
import { mockDataFazenda, mockDataSafra } from "../../data/mockData";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const SafrasHistory = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 800px)");
    const isSmallDivice = useMediaQuery("(max-width: 1300px)");

    const columns = [
        { field: "propertie", headerName: "Propriedade", flex: 1, minWidth: 150, cellClassName: "name-column--cell", resizable: false },
        { field: "gleba", headerName: "Gleba", flex: 2, minWidth: 150, cellClassName: "name-column--cell", resizable: false },
        { field: "area", headerName: "Área", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
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
                            type === "Planejado" ? colors.orangeAccent[500] : colors.orangeAccent[400]
                        }
                        borderRadius="4px"
                    >
                        {type === "Planejado" && <EqualizerIcon/>}
                        {type === "Realizado" && <TimelineIcon />}
                        {!isSmallDivice && (
                            <Typography
                                sx={{ ml: "5px", fontWeight: "bold", color: theme.palette.mode === 'dark' ? "#FFFFFF" : colors.grey[100] }}
                            >
                                {type}
                            </Typography>
                        )}
                    </Box>
                );
            }
        },    
        /*    
        { field: "status", headerName: "Status", flex: 1, type: "boolean", resizable: false, minWidth: 170,
            renderCell: ({ row: { status } }) => (
              <Box
                  width="60%"
                  m="10px auto"
                  p="5px"
                  display="flex"
                  justifyContent="center"
                  backgroundColor={status ? "red" : "green"}
                  borderRadius="4px"
              >
                  <Typography sx={{ fontWeight: "bold", color: "#FFFFFF" }}>
                      {status ? "Finalizada" : "Andamento"}
                  </Typography>
              </Box>
            )
        },*/
        { field: "cultivo", headerName: "Cultivo", flex: 1, minWidth: 100, cellClassName: "city-column--cell", resizable: false },
        { field: "semente", headerName: "Semente", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "metroLinear", headerName: "Metro Linear", type: "number", headerAlign: "left", align: "left", minWidth: 120, resizable: false },
        { field: "dosagem", headerName: "Dosagem", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "toneladas", headerName: "Toneladas", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "adubo", headerName: "Adubo", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "dataFimPlantio", headerName: "Fim Plantio", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "dataFimColheita", headerName: "Fim Colheita", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "tempoLavoura", headerName: "Tempo Lavoura", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "precMilimetrica", headerName: "Preção Milimetrica", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { 
            field: "umidade", 
            headerName: "Umidade", 
            type: "number", 
            headerAlign: "left", 
            align: "left", 
            minWidth: 100, 
            resizable: false, 
            renderCell: ({ row: { umidade } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {umidade + "%"}
                </Typography>
            )}
        },
        
        { 
            field: "impureza", 
            headerName: "Impureza", 
            type: "number", 
            headerAlign: "left", 
            align: "left", 
            minWidth: 100, 
            resizable: false,
            renderCell: ({ row: { impureza } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {impureza + "%"}
                </Typography>
            )}
        },
        { 
            field: "graosAvariados", 
            headerName: "Grãos Avariados", 
            type: "number", 
            headerAlign: "left", 
            align: "left", 
            minWidth: 100, 
            resizable: false,
            renderCell: ({ row: { graosAvariados } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {graosAvariados + "%"}
                </Typography>
            )}
         },
        { 
            field: "graosEsverdeados", 
            headerName: "Grãos Esverdeados", 
            type: "number", 
            headerAlign: "left", 
            align: "left", 
            minWidth: 100, 
            resizable: false,
            renderCell: ({ row: { graosEsverdeados } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {graosEsverdeados + "%"}
                </Typography>
            )}
         },
         { 
            field: "graosQuebrados", 
            headerName: "Grãos Quebrados", 
            type: "number", 
            headerAlign: "left", 
            align: "left", 
            minWidth: 100, 
            resizable: false,
            renderCell: ({ row: { graosQuebrados } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {graosQuebrados + "%"}
                </Typography>
            )}
         },
        { field: "prodTotal", headerName: "Prod. Total", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "prodPrevista", headerName: "Prod. Prevista", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "prodRealizada", headerName: "Prod. Realizada", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { 
            field: "comparativo", 
            headerName: "Comparativo", 
            type: "number", 
            headerAlign: "center", 
            minWidth: 100, 
            resizable: false,
            renderCell: ({ row: { prodPrevista, prodRealizada  } }) => {
                const isHigher = prodRealizada > prodPrevista; 

                return (
                    <Box
                        width="40%"
                        m="10px auto"
                        p="5px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        backgroundColor={isHigher ? colors.mygreen[500] : colors.redAccent[500]} 
                        borderRadius="4px"
                    >
                        {isHigher ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />} 
                    </Box>
                );
            }
         },
        {
            field: "porcentHect",
            headerName: "Porcentagem / HA",
            headerAlign: "center",
            flex: 1,
            align: "center",
            minWidth: 120,
            resizable: false,
            renderCell: ({ row: { porcentHect } }) =>{
                return (
                <Typography  sx={{mt: "16px"}}>
                                {porcentHect + "%"}
                </Typography>
            )}

        },
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

    const navigate = useNavigate(); 
    const handleView = (id) => {
        navigate(`/safras/${id}`);
    };
    const handleAdd = () =>{
        navigate(`/safras/add`);
    }

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Histórico Safras" subtitle="Gerencie as suas safras já finalizadas" />
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
                    rows={mockDataSafra}
                    columns={columns}
                    slots={{ toolbar: GridToolbar, }}
                />
            </Box>
        </Box>
    );
};

export default SafrasHistory;
