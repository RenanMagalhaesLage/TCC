import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataTeam } from "../../data/mockData";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";

const Team = () =>{
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const columns = [
        {field:"id", headerName:"ID", resizable: false},
        {field:"name", headerName:"Name", flex: 1, cellClassName:"name-column--cell", resizable: false},
        {field:"age", headerName:"Age", type:"number", headerAlign: "left", align:"left", resizable: false},
        {field:"phone", headerName:"Phone Number", flex: 1, resizable: false},
        {field:"email", headerName:"Email", flex: 1, resizable: false},
        {field:"access", headerName:"Access Level", flex: 1, resizable: false, renderCell: ({row:{access}}) =>{
            return(
                <Box
                    width="60%"
                    m="10px auto"
                    p="5px"
                    display="flex"
                    justifyContent="center"
                    backgroundColor={
                        access ==="admin" ? colors.myorange[500] : colors.myorange[400] //MUDAR AQUI --> CADA UM UMA COR
                    }
                    borderRadius="4px"
                >
                    {access === "admin" && <AdminPanelSettingsOutlinedIcon />}
                    {access === "manager" && <SecurityOutlinedIcon />}
                    {access === "user" && <LockOpenOutlinedIcon />}
                    <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
                        {access}
                    </Typography>
                </Box>
            )
        }},
    ];

    return(
        <Box m="20px">
            <Header title="TEAM" subtitle="Managing the team members"/>
            <Box m="40px 0 0 0" height="75vh"  maxWidth="1600px"  mx="auto"          
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
                    rows={mockDataTeam}
                    columns={columns}
                />
            </Box>
        </Box>
    )
}

export default Team;
