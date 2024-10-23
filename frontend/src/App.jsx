import React, { useState } from 'react';
import { ColorModeContext, useMode } from './theme';
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/MySidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Contacts from "./scenes/contacts";
import Form from "./scenes/form";
import FAQ from "./scenes/faq";
import Bar from "./scenes/bar";
import Pie from "./scenes/pie";
import Line from "./scenes/line";
import Login from './scenes/login';
import Register from './scenes/register';
import Properties from './scenes/properties';
import Propertie from './scenes/properties/propertie';
import PropertiesForm from './scenes/properties/form';
import PropertiesEditForm from './scenes/properties/editForm';
import Glebas from './scenes/glebas';
import Gleba from './scenes/glebas/gleba';
import GlebasForm from './scenes/glebas/form';
import GlebasEditForm from './scenes/glebas/editForm';
import Safras from './scenes/safras'
import Safra from './scenes/safras/safra';
import SafrasForm from './scenes/safras/form';
import Custos from './scenes/custos';
import SafrasHistory from './scenes/safras/history';
import SafrasEditForm from './scenes/safras/editForm';
import Invite from './scenes/invites';


function App() {
  const [theme, colorMode] = useMode();
  const [conect, setConect] = useState(false); 
  const navigate = useNavigate(); 

  const handleLogin = () => {
    setConect(true);
    navigate('/'); 
  };

  const handleLogout = () => {
    setConect(false); 
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app" style={{ display: 'flex', height: '100vh' }}>
          {conect ? (
            <>
               <Sidebar onLogout={handleLogout} />
              <main className='content' style={{ flexGrow: 1, overflow: 'auto' }}>
                <Topbar />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/form" element={<Form />} />
                  <Route path="/bar" element={<Bar />} />
                  <Route path="/pie" element={<Pie />} />
                  <Route path="/line" element={<Line />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/propriedades" element={<Properties />} />
                  <Route path="/propriedades/:id" element={<Propertie />} />
                  <Route path="/propriedades/add" element={<PropertiesForm />} />
                  <Route path="/propriedades/edit/:id" element={<PropertiesEditForm />} />
                  <Route path="/glebas" element={<Glebas />} />
                  <Route path="/glebas/:id" element={<Gleba />} />
                  <Route path="/glebas/add" element={<GlebasForm />} />
                  <Route path="/glebas/add/:id?" element={<GlebasForm />} />
                  <Route path="/glebas/edit/:id" element={<GlebasEditForm />} />
                  <Route path="/safras" element={<Safras />} />
                  <Route path="/safras/:id" element={<Safra />} />
                  <Route path="/safras/add" element={<SafrasForm />} />
                  <Route path="/safras/add/:id?" element={<SafrasForm />} />
                  <Route path="/safras/edit/:id" element={<SafrasEditForm />} />
                  <Route path="/custos" element={<Custos />} />
                  <Route path="/history" element={<SafrasHistory />} />
                  <Route path="/invites" element={<Invite />} />
                </Routes>
              </main>
            </>
          ) : (
            <Routes>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/login" />} /> {/* Redireciona para /login se tentar acessar outra rota */}
            </Routes>
          )}
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
