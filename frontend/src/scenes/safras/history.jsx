import { Box, Typography, useTheme, Button, useMediaQuery  } from "@mui/material";

import { DataGrid,GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useNavigate,useLocation } from 'react-router-dom';
import { mockDataFazenda, mockDataSafra } from "../../data/mockData";
import Header from "../../components/Header";
import VisibilityIcon from '@mui/icons-material/Visibility';
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
                <Header title="Histórico Safras" subtitle="Gerencie as suas safras que já foram finalizadas" />
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
                    slots={{ toolbar: CustomToolbar }}
                />
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

export default SafrasHistory;
