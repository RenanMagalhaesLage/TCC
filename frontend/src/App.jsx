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
import BarHectares from "./scenes/bar/barCharHectares";
import BarCategory from "./scenes/bar/barCharCategory";
import BarCustos from "./scenes/bar/barChartCustos";
import Pie from "./scenes/pie";
import Line from "./scenes/line";
import Login from './scenes/login';
import Properties from './scenes/properties';
import PropertyPage from './scenes/properties/infoPage';
import PropertyForm from './scenes/properties/form';
import PropertyEditForm from './scenes/properties/editForm';
import Glebas from './scenes/glebas';
import GlebaPage from './scenes/glebas/infoPage';
import GlebaForm from './scenes/glebas/form';
import GlebaEditForm from './scenes/glebas/editForm';
import Safras from './scenes/safras'
import SafraPage from './scenes/safras/infoPage';
import SafraForm from './scenes/safras/form';
import SafraHistory from './scenes/safras/historyPage';
import SafraEditPage from './scenes/safras/editPage';
import Custos from './scenes/custos';
import Invite from './scenes/invites';
import InvitesForm from './scenes/invites/form';
import CustosPage from './scenes/custos/custosPage';
import CustosForm from './scenes/custos/form';
import CustosEditPage from './scenes/custos/editPage';
import DashboardProjetado from './scenes/dashboard/dashboardProjetado';
import DashboardRealizado from './scenes/dashboard/dashboardRealizado';
import Storage from './scenes/storage/index';
import StoragePage from './scenes/storage/infoPage';
import StorageForm from './scenes/storage/formPage';
import StorageEditPage from './scenes/storage/editPage';

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
                  <Route path="/" />
                  <Route path="/team" element={<Team />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/form" element={<Form />} />
                  <Route path="/grafico-barra-category/:id" element={<BarCategory />} />
                  <Route path="/grafico-barra-hectares/:id" element={<BarHectares />} />
                  <Route path="/grafico-barra-custos/:id" element={<BarCustos />} />
                  <Route path="/grafico-pizza/:id" element={<Pie />} />
                  <Route path="/line" element={<Line />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/propriedades" element={<Properties />} />
                  <Route path="/propriedades/:id" element={<PropertyPage />} />
                  <Route path="/propriedades/add" element={<PropertyForm />} />
                  <Route path="/propriedades/edit/:id" element={<PropertyEditForm />} />
                  <Route path="/glebas" element={<Glebas />} />
                  <Route path="/glebas/:id" element={<GlebaPage />} />
                  <Route path="/glebas/add" element={<GlebaForm />} />
                  <Route path="/glebas/add/:id?" element={<GlebaForm />} />
                  <Route path="/glebas/edit/:id" element={<GlebaEditForm />} />
                  <Route path="/safras" element={<Safras />} />
                  <Route path="/safras/:id" element={<SafraPage />} />
                  <Route path="/safras/add" element={<SafraForm />} />
                  <Route path="/safras/add/:id?" element={<SafraForm />} />
                  <Route path="/safras/edit/:id" element={<SafraEditPage />} />
                  <Route path="/custos" element={<Custos />} />
                  <Route path="/custos/:id" element={<CustosPage />} />
                  <Route path="/custos/add" element={<CustosForm />} />
                  <Route path="/custos/edit/:id" element={<CustosEditPage />} />
                  <Route path="/historico-safras" element={<SafraHistory />} />
                  <Route path="/convites" element={<Invite />} />
                  <Route path="/convites/add" element={<InvitesForm />} />
                  <Route path="/projetado" element={<DashboardProjetado />} />
                  <Route path="/realizado" element={<DashboardRealizado />} />
                  <Route path="/estoque" element={<Storage />} />
                  <Route path="/estoque/:id" element={<StoragePage />} />
                  <Route path="/estoque/add" element={<StorageForm />} />
                  <Route path="/estoque/edit/:id" element={<StorageEditPage />} />
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
