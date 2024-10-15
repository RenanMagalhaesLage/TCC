import React, { useState } from 'react';
import { Grid, Paper, Avatar, Typography } from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios'; 
axios.defaults.baseURL = 'http://localhost:3000'; // URL do seu backend
import secureLocalStorage from 'react-secure-storage';



const Login = ({ onLogin }) => { 
    const paperStyle = {
        padding: 20,
        height: '50vh',
        width: 400,
        margin: '20px auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    };

    const avatarStyle = {
        backgroundColor: '#1bbd7e',
        marginBottom: '25px',
        width: 80,
        height: 80,
    };

    const handleLoginSuccess = async (credentialResponse) => {
        //console.log(credentialResponse);

        // Envia o token para o servidor para criar o usuário
        try {
            const response = await axios.post('/protegida', {
                token: credentialResponse.credential
            }, {
                headers: {
                    Authorization: `Bearer ${credentialResponse.credential}`
                }
            });
            console.log(response.data); // Log para verificar a resposta do servidor
            handleSave(response.data.name, response.data.email, response.data.picture);
            onLogin(); // Chama a função onLogin para atualizar o estado no App
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleLoginError = () => {
        console.log('Login Failed');
    };

    //Local Storage

    const [retrievedUser, setRetrievedUser] = useState(null);

    const handleSave = (name, email, picture) => {
        const user = { name, email, picture }; 
        secureLocalStorage.setItem('userData', JSON.stringify(user)); 
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
        setRetrievedUser(null); // Limpa o estado do objeto recuperado
        //alert('Dados removidos com sucesso!');
    };

    return (
        <Grid container style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            <Grid item>
                <Paper elevation={3} style={paperStyle}>
                    <Avatar style={avatarStyle}>
                        <AgricultureIcon sx={{ fontSize: 45 }} />
                    </Avatar>
                    <Typography variant="h1" gutterBottom style={{ marginBottom: "60px" }}>
                        SmartPlantio
                    </Typography>
                    <GoogleLogin
                        onSuccess={handleLoginSuccess} // Atualizado para a nova função
                        onError={handleLoginError}

                    />
                </Paper>
            </Grid>
        </Grid>
    );
};

export default Login;
