import { Box, Typography, useTheme, Button, useMediaQuery  } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataFazenda } from "../../data/mockData";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const Glebas = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 800px)");
    const isSmallDivice = useMediaQuery("(max-width: 1300px)");

    const columns = [
        { field: "propertie", headerName: "Propriedade", flex: 1, minWidth: 150, cellClassName: "name-column--cell", resizable: false },
        { field: "gleba", headerName: "Gleba", flex: 2, minWidth: 150, cellClassName: "name-column--cell", resizable: false },
        { field: "cultivo", headerName: "Cultivo", flex: 1, minWidth: 100, cellClassName: "city-column--cell", resizable: false },
        { field: "area", headerName: "Área", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "semente", headerName: "Semente", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "metroLinear", headerName: "Metro Linear", type: "number", headerAlign: "left", align: "left", minWidth: 120, resizable: false },
        { field: "dosagem", headerName: "Dosagem", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "toneladas", headerName: "Toneladas", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "adubo", headerName: "Adubo", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "dataFimPlantio", headerName: "Fim Plantio", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "dataFimColheita", headerName: "Fim Colheita", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "tempoLavoura", headerName: "Tempo Lavoura", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "precMilimetrica", headerName: "Preção Milimetrica", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "umidade", headerName: "Umidade", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "impureza", headerName: "Impureza", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "graosAvariados", headerName: "Grãos Avariados", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "graosEsverdeados", headerName: "Grãos Esverdeados", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "prodTotal", headerName: "Prod. Total", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "prodPrevista", headerName: "Prod. Prevista", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "prodRealizada", headerName: "Prod. Realizada", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
        { field: "porcentHect", headerName: "Porcentagem", type: "number", headerAlign: "left", align: "left", minWidth: 100, resizable: false },
    ];
    

    const handleView = (row) => {
        console.log("Visualizando:", row);
        // Lógica para visualizar a fazenda
    };

    const handleEdit = (row) => {
        console.log("Editando:", row);
        // Lógica para editar a fazenda
    };

    const handleDelete = (id) => {
        console.log("Excluindo fazenda com ID:", id);
        // Lógica para excluir a fazenda
    };

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Safras" subtitle="Gerencie as suas safras" />
                <Box>
                    <Button
                        sx={{
                        backgroundColor: colors.mygreen[400],
                        color: colors.grey[100],
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: "10px 20px",
                        }}
                    >
                        <AddCircleOutlineIcon sx={{ mr: isMobile? "0px" :"10px" }} />
                        {!isMobile && ("Adicionar Safra")}
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
                        backgroundColor: colors.mygreen[200],
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.mygreen[200],
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.mygreen[200]} !important`,
                    },
                }}>
                <DataGrid
                    rows={mockDataFazenda}
                    columns={columns}
                />
            </Box>
        </Box>
    );
};

export default Glebas;
