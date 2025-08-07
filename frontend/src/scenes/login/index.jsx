import React, { useState } from 'react';
import { Grid, Paper, Avatar, Typography, useTheme, useMediaQuery, Box,TextField,Link,Button} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios'; 
axios.defaults.baseURL = 'http://localhost:3000'; // URL do seu backend
import secureLocalStorage from 'react-secure-storage';
import { tokens } from "../../theme";

const Login = ({ onLogin }) => { 
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const isMobile = useMediaQuery("(max-width: 800px)");
    
    const paperStyle = {
        padding: 20,
        height: '55vh',
        width: isMobile ? 300 : 450,
        margin: '20px auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    };

    const avatarStyle = {
        backgroundColor: colors.mygreen[600],
        marginBottom: '30px',
        width: 100,
        height: 100,
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)'
    };

    const handleLoginSuccess = async (credentialResponse) => {
        try {
            const response = await axios.post('/login', 
                { token: credentialResponse.credential }, 
                {
                  headers: {
                    Authorization: `Bearer ${credentialResponse.credential}`
                  }
                }
            );
            handleSave(response.data.name, response.data.email, response.data.picture, credentialResponse.credential);
            onLogin();
        } catch (error) {
            if (error.response?.status === 401) {
                alert('Sessão expirada. Faça login novamente.');
                secureLocalStorage.removeItem('userData');
                secureLocalStorage.removeItem('auth_token');
                window.location.href = '/login';
            }
            console.log(error.message);
        }
    };

    const handleLoginError = () => {
        console.log('Login Failed');
    };

    //Local Storage

    const [retrievedUser, setRetrievedUser] = useState(null);

    const handleSave = (name, email, picture, credential) => {
        const user = { name, email, picture }; 
        secureLocalStorage.setItem('userData', JSON.stringify(user)); 
        secureLocalStorage.setItem('auth_token', credential);
        //alert('Dados armazenados com sucesso!');
    };

    const handleRetrieve = () => {
        const storedUser = secureLocalStorage.getItem('userData'); 
        if (storedUser) {
        setRetrievedUser(JSON.parse(storedUser));
        } else {
        setRetrievedUser(null);
        //alert('Nenhum dado encontrado!');
        }
    };
    
    const handleRemove = () => {
        secureLocalStorage.removeItem('userData');
        secureLocalStorage.removeItem('auth_token');
        setRetrievedUser(null); // Limpa o estado do objeto recuperado
        //alert('Dados removidos com sucesso!');
    };

  return (
    <Grid
      container
      sx={{
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(at 70% 51%, rgba(200, 255, 200, 0.7), rgba(255, 255, 255, 1))',
      }}
    >
      <Grid item container sx={{ width: '70%', height: '80%', borderRadius: 2, overflow: 'hidden' }}>
        {/* Formulário */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
            padding: 4,
            borderRadius: '3px 0 0 3px',
          }}
        >
            <Avatar style={avatarStyle}>
                <AgricultureIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <Typography variant="h1" gutterBottom style={{ marginBottom: "15px" }}>
                SmartPlantio
            </Typography>
            <Typography variant="p" gutterBottom style={{ marginBottom: "60px" }}>
                SISTEMA DE GESTÃO DE SAFRAS PARA PEQUENOS PRODUTORES
            </Typography>
            <GoogleLogin
                onSuccess={handleLoginSuccess} 
                onError={handleLoginError}
            />
        </Box>

        {/* Box com a imagem */}
        <Box
          sx={{
            flex: 1,
            backgroundImage: 'url(/pexels-alejandro-barron-21404-96715.jpg)',  
            backgroundSize: 'cover', 
            backgroundPosition: 'center',  
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderLeft: '1px solid #ddd',
            '@media (max-width:700px)': {
              display: 'none',
            },
          }}
        >
        </Box>
      </Grid>
    </Grid>
  );
};



export default Login;
