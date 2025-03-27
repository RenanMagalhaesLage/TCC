import { Box, IconButton, useTheme, InputBase, Badge, Paper, Typography, Tooltip } from "@mui/material";
import {useContext, useState,  useEffect, useRef } from "react";
import { ColorModeContext, tokens} from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsIcon from "@mui/icons-material/Notifications";


const Topbar = () =>{
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    const [invisible, setInvisible] = useState(false);
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(false); // Para controlar a visibilidade suave
    const notificationRef = useRef(null);

    const handleBadgeVisibility = () => {
        setInvisible(!invisible);
      };

      const handleToggle = () => {
        if (open) {
          setVisible(false); // Primeiro oculta com a animação
          setTimeout(() => setOpen(false), 300); // Fecha após a animação
        } else {
          setOpen(true);
          setTimeout(() => setVisible(true), 10); // Aguarda para garantir o início da animação
        }
      };

      useEffect(() => {
        const handleClickOutside = (event) => {
          if (notificationRef.current && !notificationRef.current.contains(event.target)) {
            setVisible(false);
            setTimeout(() => setOpen(false), 300);
          }
        };
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [notificationRef]);

    return (
        <Box display="flex" justifyContent="space-between" p={2}>
            {/* SEARCH BAR */}
            {/*
            <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
                <InputBase sx={{ml:2, flex: 1 }} placeholder="Search"></InputBase>
                <IconButton type="button" sx={{p:1}}>
                    <SearchIcon/>
                </IconButton>
            </Box>
            */}
            {/* ICONS */}
            <Box display="flex">
                <Tooltip title="Tema de Tela" >
                    <IconButton onClick={colorMode.toggleColorMode}>
                        {theme.palette.mode === "dark" ? (
                            <DarkModeOutlinedIcon />
                        ) : (
                            <LightModeOutlinedIcon />
                        )}
                    </IconButton>
                </Tooltip>     
                {/*           
                <Tooltip title="Notificações" >
                    <IconButton onClick={handleToggle}>
                        <Badge variant="dot" color={"success"} invisible={invisible} 
                        >
                            {open ? <NotificationsIcon /> : <NotificationsOutlinedIcon />}
                        </Badge>
                    </IconButton>
                </Tooltip>
                
                {/* Campo de notificações */}
                {/*
                {open && (
                    <Paper
                        ref={notificationRef} 
                        elevation={4}
                        sx={{
                            position: "absolute",
                            top: "50px",
                            right: "20px",
                            width: "300px",
                            padding: "16px",
                            zIndex: 10,
                            borderRadius: "8px",
                            animation: "fadeIn 0.3s ease-in-out",
                            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                            backgroundColor: theme.palette.mode === "dark" ? colors.primary[400] : "#fff",
                            opacity: visible ? 1 : 0, // Controla a opacidade para o fade
                            transform: visible ? "translateY(0)" : "translateY(-10px)", // Move para cima ao fechar
                            transition: "opacity 0.3s ease, transform 0.3s ease", // Suaviza o fechamento e abertura
                        }}
                    >
                        <Box>
                        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
                            Notificações
                        </Typography>
                        <Typography variant="body2">Você tem 3 novas notificações.</Typography>
                        <Typography variant="body2" sx={{ marginTop: "5px" }}>• Notificação 1</Typography>
                        <Typography variant="body2" sx={{ marginTop: "5px" }}>• Notificação 2</Typography>
                        <Typography variant="body2" sx={{ marginTop: "5px" }}>• Notificação 3</Typography>
                        </Box>
                  </Paper>
                )}
                <Tooltip title="Dúvidas Frequentes" >
                    <IconButton>
                        <HelpOutlineOutlinedIcon />
                    </IconButton>
                </Tooltip>*/}
            </Box>
        </Box>
    )
}

export default Topbar;