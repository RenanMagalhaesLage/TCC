import React from 'react';
import { Grid, Paper, Avatar, TextField, Button, Typography, Box } from '@mui/material';
import YardIcon from '@mui/icons-material/Yard';
import { Formik } from 'formik';
import * as yup from 'yup';

const Register = () => {
    const paperStyle = {
        padding: 20,
        width: 400,
        margin: '20px auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        minHeight: '60vh', // Set a minimum height
    };

    const avatarStyle = {
        backgroundColor: '#1bbd7e',
        marginBottom: '10px',
        width: 60, // Increased size
        height: 60, // Increased size
    };
    
    const btnStyle = { margin: '15px 0 8px 0', padding: '8px 0', width: '70%' };
    
    const initialValues = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        cellphone: '',
        password2: ''
    };
    
    const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

    const checkoutSchema = yup.object().shape({
        email: yup.string().email('Escreva um e-mail válido!').required("Required"),
        firstName: yup.string().required("required"),
        lastName: yup.string().required("required"),
        cellphone: yup
        .string()
        .matches(phoneRegExp, "Phone number is not valid")
        .required("required"),
        password: yup.string().required("Required"),
        password2: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Required')
    });
    
    const handleFormSubmit = (values, { resetForm, setSubmitting }) => {
        console.log(values);
        setTimeout(() => {
            resetForm();
            setSubmitting(false);
        }, 2000);
    };

    return (
        <Grid container style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Grid item>
                <Paper elevation={3} style={paperStyle}>
                    <Avatar style={avatarStyle}>
                        <YardIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h2" gutterBottom>
                        SmartPlantio
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Cadastre-se
                    </Typography>
                    <Formik
                        onSubmit={handleFormSubmit}
                        initialValues={initialValues}
                        validationSchema={checkoutSchema}
                    >
                        {({ values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting }) => (
                            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                                <TextField
                                    label="Nome"
                                    placeholder="Digite seu nome"
                                    name='firstName'
                                    variant="filled"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.firstName}
                                    fullWidth
                                    required
                                    margin="normal"
                                    error={!!touched.firstName && !!errors.firstName}
                                    helperText={touched.firstName && errors.firstName}
                                />
                                <TextField
                                    label="Sobrenome"
                                    placeholder="Digite seu sobrenome"
                                    name='lastName'
                                    variant="filled"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.lastName}
                                    fullWidth
                                    required
                                    margin="normal"
                                    error={!!touched.lastName && !!errors.lastName}
                                    helperText={touched.lastName && errors.lastName}
                                />
                                <TextField
                                    label="Telefone"
                                    placeholder="Digite seu telefone"
                                    name='cellphone'
                                    variant="filled"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.cellphone}
                                    fullWidth
                                    required
                                    margin="normal"
                                    error={!!touched.cellphone && !!errors.cellphone}
                                    helperText={touched.cellphone && errors.cellphone}
                                />
                                <TextField
                                    label="E-mail"
                                    placeholder="Digite seu e-mail"
                                    name='email'
                                    variant="filled"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.email}
                                    fullWidth
                                    required
                                    margin="normal"
                                    error={!!touched.email && !!errors.email}
                                    helperText={touched.email && errors.email}
                                />
                                <TextField
                                    label="Senha"
                                    placeholder="Digite sua senha"
                                    name='password'
                                    variant="filled"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.password}
                                    type="password"
                                    fullWidth
                                    required
                                    margin="normal"
                                    error={!!touched.password && !!errors.password}
                                    helperText={touched.password && errors.password}
                                />
                                <TextField
                                    label="Confirme sua senha"
                                    placeholder="Digite sua senha"
                                    name='password2'
                                    variant="filled"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.password2}
                                    type="password"
                                    fullWidth
                                    required
                                    margin="normal"
                                    error={!!touched.password2 && !!errors.password2}
                                    helperText={touched.password2 && errors.password2}
                                />
                                <Box display="flex" justifyContent="center" mt={2}>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        variant="contained"
                                        style={btnStyle}
                                        disabled={isSubmitting} // Disable button while submitting
                                    >
                                        {isSubmitting ? "Loading" : "Cadastrar"}
                                    </Button>
                                </Box>
                            </form>
                        )}
                    </Formik>                    
                </Paper>
            </Grid>
        </Grid>
    );
};

export default Register;
