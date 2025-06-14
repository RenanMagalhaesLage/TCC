import React, { useState, useEffect } from 'react';
import secureLocalStorage from 'react-secure-storage';
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, useMediaQuery } from "@mui/material";
import { Link,useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LogoutIcon from '@mui/icons-material/Logout';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FenceIcon from '@mui/icons-material/Fence';
import GrassIcon from '@mui/icons-material/Grass';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GiteIcon from '@mui/icons-material/Gite';
import Tooltip from '@mui/material/Tooltip';

const Item = ({ title, to, icon, selected, setSelected, onClick }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Tooltip title={title} arrow> {/* Tooltip com o título do item */}
      <MenuItem
        active={selected === title}
        style={{
          color: colors.grey[100],
        }}
        onClick={() => {
          setSelected(title);
          if (onClick) onClick(); 
        }}
        icon={icon}
      >
        <Typography>{title}</Typography>
        <Link to={to} />
      </MenuItem>
    </Tooltip>
  );
};

const Sidebar = ({ onLogout }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [selected, setSelected] = useState("Dashboard");
  const navigate = useNavigate(); 

  //Loca Storage
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = secureLocalStorage.getItem('userData'); 
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith('/talhoes')) {
      setSelected('Talhões');
    }else if(location.pathname.startsWith('/safras')){
      setSelected('Safras');
    }else if(location.pathname.startsWith('/custos')){
      setSelected('Custos');
    }else if(location.pathname.startsWith('/estoque')){
      setSelected('Estoque');
    }else if(location.pathname.startsWith('/convites')){
      setSelected('Convites');
    }else if(location.pathname.startsWith('/home')){
      setSelected('Início');
    }
  }, [location.pathname]);


  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  const handleLogout = () => {
    secureLocalStorage.removeItem('userData');
    secureLocalStorage.removeItem('auth_token');
    onLogout(); 
    navigate('/login'); 
  };

  return (
    <Box
      sx={{
        height: '100vh', 
        display: 'flex', 
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#3b9e3b !important",
        },
        "& .pro-menu-item.active": {
          color: "#3b9e3b !important",
        },

      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={isMobile? null: () => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  SmartPlantio
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Início"
              to="/home"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Convites"
              to="/convites"
              icon={<EmailOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 15px" }}
            >
              Pessoal
            </Typography>
            <Item
              title="Propriedades"
              to="/propriedades"
              icon={< WarehouseIcon/>}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Talhões"
              to="/talhoes"
              icon={< FenceIcon/>}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Safras"
              to="/safras"
              icon={< GrassIcon/>}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Histórico Safras"
              to="/historico-safras"
              icon={<PendingActionsIcon/>}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Estoque"
              to="/estoque"
              icon={<GiteIcon/>}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              {isCollapsed ? "Custo" : "Custo Agrícola"}
            </Typography>
            <Item
              title="Custos"
              to="/custos"
              icon={<ReceiptOutlinedIcon/>}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Custo Total"
              to="/custo-total"
              icon={<AttachMoneyIcon/>}
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 15px" }}
            >
              Painéis
            </Typography>
            <Item
              title="Projetado"
              to="/projetado"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Realizado"
              to="/realizado"
              icon={<TimelineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            
          {/* 
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Páginas com coisas
            </Typography>
            <Item
              title="Profile Form"
              to="/form"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Bar Chart"
              to="/grafico-barra"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Pie Chart"
              to="/grafico-pizza"
              icon={<PieChartOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Line Chart"
              to="/line"
              icon={<TimelineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            */}
            <Divider variant="middle" component="li" sx={{marginRight: isCollapsed ?  0 : 2, marginLeft: -1 }}/>


            {!isCollapsed && userData && (
              <Box mb="30px" display="flex" alignItems="center" mt="50px">
              <Avatar 
                alt={userData.name} 
                src={userData.picture} 
                sx={{ width: 30, height: 30, marginRight: 2 }} 
              />
              <Box>
                <Typography
                  variant="h4"
                  color={colors.grey[100]}
                >
                  {userData.name}
                </Typography>
                <Typography
                  variant="h7"
                  color={colors.grey[300]}
                >
                  {userData.email}
                </Typography>
              </Box>
            </Box>

            )}

            <Box mt={isCollapsed ? "30px" : "0px"}>
            {/*
            <Item
              title="Dúvidas Frequentes"
              to="/faq"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />*/}
            <Item
              title="Sair"
              to="#"
              icon={<LogoutIcon />}
              selected={selected}
              setSelected={setSelected}
              onClick={handleLogout} 
            />
          </Box>
            
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;