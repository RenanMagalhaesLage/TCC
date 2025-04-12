import React, { useState, useEffect } from "react";
import { useNavigate,useParams } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import axios from "axios";
import { Box, Typography, useTheme, Button, useMediaQuery,Autocomplete,TextField,Checkbox, FormControlLabel, Modal, Backdrop, Fade, Chip,Tooltip,IconButton } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import DoneIcon from '@mui/icons-material/Done';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import * as yup from "yup";

import { Formik, Form, Field } from "formik";

const TotalPage = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [safraOptions, setSafraOptions] = useState([]);   
    const [custo,setCusto] = useState("");
    const [safraId, setSafraId] = useState("");
    const [showPanel, setShowPanel] = useState(false);

    const itens = [
        {
          nome: "Fertilizante Nitrogenado",
          quantidade: 100,
          unidade: "kg",
          preco: 5.50,
        },
        {
          nome: "Herbicida X",
          quantidade: 20,
          unidade: "litros",
          preco: 18.75,
        },
        {
          nome: "Semente de Milho",
          quantidade: 50,
          unidade: "kg",
          preco: 12.30,
        },
        {
          nome: "Inseticida Y",
          quantidade: 15,
          unidade: "litros",
          preco: 22.00,
        },
        {
          nome: "Adubo Orgânico",
          quantidade: 200,
          unidade: "kg",
          preco: 4.20,
        },
    ];

    const categoriasTotais = [
        { nome: "Administrativo", total: 1250.00, porcentagem: "3.85%" },
        { nome: "Arrendamento", total: 9800.50, porcentagem: "30.18%" },
        { nome: "Operações", total: 4120.75, porcentagem: "12.69%" },
        { nome: "Corretivos e Fertilizantes", total: 6350.00, porcentagem: "19.54%" },
        { nome: "Sementes", total: 2780.40, porcentagem: "8.55%" },
        { nome: "Defensivos", total: 3499.99, porcentagem: "10.77%" },
    ];

    const descritivo = [
        { nome: "Preço de venda esperado (R$/saco)", total: 85.00 },
        { nome: "Receita bruta esperada (R$/ha)", total: 3400.00 },
        { nome: "Receita bruta total (Gleba)", total: 102000.00 },
        { nome: "Lucro esperado (R$/ha)", total: 1150.00 },
        { nome: "LAIR (R$)", total: 78500.00 },
    ];
    const initialValues = {
        safra: "",
        property: ""
    };

    useEffect(() => {
        const storedUser = secureLocalStorage.getItem('userData'); 
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        if (userData && userData.email) { 
          const fetchSafraData = async () => {
            try {
              const response = await axios.get(`http://localhost:3000/safras-by-user`, {
                params: { email: userData.email }
              });
                          
              const safras = response.data
                .map(safra => ({
                  id: safra.id,
                  name: `${safra.name} - ${safra.cultivo}`
              }));
              setSafraOptions(safras);
    
            } catch (error) {
              console.log("ERRO - ao buscar no banco de dados.");
            }
          };
          fetchSafraData();
        }
    }, [userData]);  
    
    const handleFormSubmit = async (values) => {
        setShowPanel(false);
        setSafraId(values.safra);      
        try {
            const response = await axios.get(`http://localhost:3000/report-custo`,{
                params: { id: values.safra}
            });
            const custo = response.data;
            setCusto(custo);
      
          setShowPanel(true); 
        } catch (error) {
          console.error('Erro ao buscar dados dos custos da safra:', error);
        }
      
        setTimeout(() => {
          setShowPanel(true);
        }, 300); 
    };

    const navigate = useNavigate(); 
    const handleChip = () => {
        //console.info('You clicked the Chip.');
    }; 

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Custo Total" subtitle="Informações do custo total de uma safra" />
            </Box>

            <Formik
                    onSubmit={handleFormSubmit}
                    initialValues={initialValues}
                    validationSchema={checkoutSchema}
                  >
                  {({ values,
                      errors,
                      touched,
                      handleBlur,
                      handleChange,
                      handleSubmit,
                      setFieldValue }) => (
                    <Form>
                      <Box
                        display="grid"
                        gap="30px"
                        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                      >
                        <Autocomplete
                          disablePortal
                          id="safras"
                          options={safraOptions}
                          getOptionLabel={(option) => option.name || ""}
                          name="safra"
                          sx={{ gridColumn: isMobile ? "span 4" : "span 2" }}
                          value={
                            values.safra 
                              ? safraOptions.find((option) => option.id === values.safra) 
                              : null
                          } 
                          onChange={(event, value) => {
                            setFieldValue('safra', value?.id || null);
                            if (value) {
                              setSafraId(value?.id);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              label="Safra"
                              variant="filled"
                              name="property"
                              error={!!touched.safra && !!errors.safra}
                              helperText={touched.safra && errors.safra}
                              onBlur={handleBlur} 
                            />
                          )}
                          noOptionsText="Nenhuma Safra disponível"
                        />     
                      </Box>
                      <Box
                        display="grid"
                        gridTemplateColumns="repeat(12, 1fr)"
                        gridAutoRows="100px"
                        gap="20px"
                      >
                        {/* Botão de Envio */}
                        <Box
                          gridColumn={"span 12"}
                          display="flex"
                          alignItems="center"
                          justifyContent="flex-end"
                        >
                          <Button
                            type="submit"
                            sx={{
                              backgroundColor: colors.mygreen[400],
                              color: colors.grey[100],
                              fontSize: "14px",
                              fontWeight: "bold",
                              padding: "10px 20px",
                            }}
                          >
                            Gerar Relatório de Custo
                          </Button>
                        </Box>
                      </Box>
                    </Form>
                  )}
            </Formik>
            
            <Box m="40px 0 0 0" height="75vh" maxWidth="1600px" mx="auto"
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
                {showPanel && (
                <Box
                    display="grid"
                    gridTemplateColumns="repeat(12, 1fr)"
                    gridAutoRows="140px"
                    gap="20px"
                    paddingBottom="300px"
                >
                    <Box
                        gridColumn="span 12"
                        display="grid"
                        gridTemplateColumns={isMobile ? "1fr" : "repeat(2, 1fr)"}
                        padding="25px 0px"
                        marginTop={"-60px"}
                    >
                        <Box display="flex" flexWrap="wrap" gap="10px"> 
                            <Chip
                                label={custo.status ? "Finalizado" : "Em Andamento"}
                                deleteIcon={custo.status ? <DoneIcon /> : <HourglassBottomIcon/>}
                                onClick={handleChip}
                                onDelete={handleChip}
                                sx={{ padding: "10px", fontWeight: "bold", flexShrink: 0 }} 
                            />
                            <Chip
                                label={custo.type}
                                deleteIcon={custo.type === "Planejado" ? <DoneIcon /> : <DoneAllIcon/>}
                                onClick={handleChip}
                                onDelete={handleChip}
                                sx={{ padding: "10px", fontWeight: "bold", flexShrink: 0 }} 
                             />
                        </Box>
                    </Box>
                    <Box
                        gridColumn="span 12"
                        backgroundColor={colors.primary[400]}
                        display="grid"
                        gridTemplateColumns={isMobile ? "1fr" : "repeat(2, 1fr)"} 
                        padding="25px 35px 30px 35px"
                        height={isMobile ? "auto" : "initial"} 
                        minHeight={isMobile ? "500px" : "100px"} 
                        marginBottom={isMobile ? "0" :"150px"}
                        marginTop={isMobile ? "-60px" :"-130px"}
                        sx={{boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",}}
                    >
                        {/* Primeira Coluna */}
                        <Box  gridColumn={isMobile ? "span 12" : "span 1"} display="flex" flexDirection="column" alignItems="flex-start" >
                            <Box display="flex" alignItems="center" marginBottom="15px" >
                                <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                Safra:
                                </Typography>
                                <Typography variant="body1" color={colors.grey[300]}>
                                {custo.safraName}
                                </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" marginBottom="15px">
                                <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                Glebas:
                                </Typography>
                                <Typography variant="body1" color={colors.grey[300]}>
                                {custo.glebas}
                                </Typography>
                            </Box>
                                                     
                        </Box>

                        {/* Segunda Coluna */}
                        <Box  gridColumn={isMobile ? "span 12" : "span 1"} display="flex" flexDirection="column" alignItems="flex-start">
                            <Box display="flex" alignItems="center" marginBottom="15px">
                                <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                Área (hectares):
                                </Typography>
                                <Typography variant="body1" color={colors.grey[300]}>
                                {custo.areaTotal}
                                </Typography>
                            </Box>  
                            <Box display="flex" alignItems="center" marginBottom="15px">
                                <Typography variant="h6" fontWeight="bold" color={colors.grey[100]} marginRight="10px">
                                Cultivo:
                                </Typography>
                                <Typography variant="body1" color={colors.grey[300]}>
                                {custo.cultivo}
                                </Typography>
                            </Box>       
                        </Box>
                    </Box>
                    {/*Tabela Categoria Corretivos e Fertilizantes  */}
                    <Box
                        gridColumn="span 12"
                        backgroundColor={colors.primary[400]}
                        display="grid"
                        padding="25px 35px 30px 35px"
                        height="auto"
                        marginTop={isMobile ?"300px" :"-130px"}
                        minHeight={isMobile ?"400px" :"260px"} 
                        sx={{
                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",
                            overflowX: "auto",
                        }}
                    >
                        <Typography variant="h3" 
                            sx={{
                                marginBottom: "20px"
                            }}
                            color={colors.mygreen[800]}
                        >
                            Corretivos e Fertilizantes
                        </Typography>
                        {/* Cabeçalho da Tabela */}
                        <Box
                            display="grid"
                            gridTemplateColumns={isMobile ? "repeat(5, minmax(100px, 1fr))" : "repeat(5, 1fr)"}
                            padding="10px 0"
                            fontWeight="bold"
                            color={colors.grey[100]}
                            sx={{
                                borderBottom: `2px solid ${colors.mygreen[800]}`,
                            }}                            
                        >
                            <Typography variant="body1">Nome</Typography>
                            <Typography variant="body1">Quantidade</Typography>
                            <Typography variant="body1">Unidade</Typography>
                            <Typography variant="body1">Preço</Typography>
                            <Typography variant="body1">Preço Total</Typography>
                        </Box>

                        {/* Linhas da Tabela */}
                        {Array.isArray(custo.corretivosFertilizantes) && custo.corretivosFertilizantes.map((item, id) => (
                            <Box
                                key={id}
                                display="grid"
                                gridTemplateColumns={isMobile ? "repeat(5, minmax(100px, 1fr))" : "repeat(5, 1fr)"}
                                padding="10px 0"
                                borderBottom={theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" :"1px solid rgba(205, 204, 204, 0.53)" }
                                color={colors.grey[300]}
                            >
                                <Typography variant="body2">{item.name}</Typography>
                                <Typography variant="body2">{item.quantity}</Typography>
                                <Typography variant="body2">{item.unit}</Typography>
                                <Typography variant="body2">R$ {item.price.toFixed(2)}</Typography>
                                <Typography variant="body2">R$ {item.totalValue.toFixed(2)}</Typography>
                            </Box>
                        ))}
                        {/* Linha de Total Geral */}
                        <Box
                            display="grid"
                            gridTemplateColumns={isMobile ? "repeat(5, minmax(100px, 1fr))" : "repeat(5, 1fr)"}
                            padding="12px 0"
                            marginTop="10px"
                            borderTop={`2px solid ${colors.primary[400]}`}
                            fontWeight="bold"
                            color={colors.grey[100]}
                        >
                            <Typography variant="body2" gridColumn="span 4" textAlign="right" marginRight={"5px"}>
                                Total - Corretivos e Fertilizantes:
                            </Typography>
                            <Typography variant="body2">
                                R$ {custo.corretivosFertilizantes?.[0]?.total|| "0,00"}                             
                            </Typography>
                        </Box>
                    </Box>
                    {/*Tabela Categoria Sementes  */}
                    <Box
                        gridColumn="span 12"
                        backgroundColor={colors.primary[400]}
                        display="grid"
                        padding="25px 35px 30px 35px"
                        height="auto"
                        marginTop={isMobile ?"550px" :"0px"}
                        minHeight={isMobile ?"400px" :"260px"} 
                        sx={{
                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",
                            overflowX: "auto",
                        }}
                    >
                        <Typography variant="h3" 
                            sx={{
                                marginBottom: "20px"
                            }}
                            color={colors.mygreen[800]}
                        >
                            Sementes
                        </Typography>
                        {/* Cabeçalho da Tabela */}
                        <Box
                            display="grid"
                            gridTemplateColumns={isMobile ? "repeat(5, minmax(100px, 1fr))" : "repeat(5, 1fr)"}
                            padding="10px 0"
                            fontWeight="bold"
                            color={colors.grey[100]}
                            sx={{
                                borderBottom: `2px solid ${colors.mygreen[800]}`,
                            }}                            
                        >
                            <Typography variant="body1">Nome</Typography>
                            <Typography variant="body1">Quantidade</Typography>
                            <Typography variant="body1">Unidade</Typography>
                            <Typography variant="body1">Preço</Typography>
                            <Typography variant="body1">Preço Total</Typography>
                        </Box>

                        {/* Linhas da Tabela */}
                        {Array.isArray(custo.sementes) && custo.sementes.map((item, id) => (
                            <Box
                                key={id}
                                display="grid"
                                gridTemplateColumns={isMobile ? "repeat(5, minmax(100px, 1fr))" : "repeat(5, 1fr)"}
                                padding="10px 0"
                                borderBottom={theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" :"1px solid rgba(205, 204, 204, 0.53)" }
                                color={colors.grey[300]}
                            >
                                <Typography variant="body2">{item.name}</Typography>
                                <Typography variant="body2">{item.quantity}</Typography>
                                <Typography variant="body2">{item.unit}</Typography>
                                <Typography variant="body2">R$ {item.price.toFixed(2)}</Typography>
                                <Typography variant="body2">R$ {item.totalValue.toFixed(2)}</Typography>
                            </Box>
                        ))}
                        {/* Linha de Total Geral */}
                        <Box
                            display="grid"
                            gridTemplateColumns={isMobile ? "repeat(5, minmax(100px, 1fr))" : "repeat(5, 1fr)"}
                            padding="12px 0"
                            marginTop="10px"
                            borderTop={`2px solid ${colors.primary[400]}`}
                            fontWeight="bold"
                            color={colors.grey[100]}
                        >
                            <Typography variant="body2" gridColumn="span 4" textAlign="right" marginRight={"5px"}>
                                Total - Sementes:
                            </Typography>
                            <Typography variant="body2">
                                R$ {custo.sementes?.[0]?.total|| "0,00"} 
                            </Typography>
                        </Box>
                    </Box>
                    {/*Tabela Categoria Defensivos  */}
                    <Box
                        gridColumn="span 12"
                        backgroundColor={colors.primary[400]}
                        display="grid"
                        padding="25px 35px 30px 35px"
                        height="auto"
                        marginTop={isMobile ?"800px" :"120px"}
                        minHeight={isMobile ?"400px" :"260px"}  
                        sx={{
                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",
                            overflowX: "auto",
                        }}
                    >
                        <Typography variant="h3" 
                            sx={{
                                marginBottom: "20px"
                            }}
                            color={colors.mygreen[800]}
                        >
                            Defensivos
                        </Typography>
                        {/* Cabeçalho da Tabela */}
                        <Box
                            display="grid"
                            gridTemplateColumns={isMobile ? "repeat(5, minmax(100px, 1fr))" : "repeat(5, 1fr)"}
                            padding="10px 0"
                            fontWeight="bold"
                            color={colors.grey[100]}
                            sx={{
                                borderBottom: `2px solid ${colors.mygreen[800]}`,
                            }}                            
                        >
                            <Typography variant="body1">Nome</Typography>
                            <Typography variant="body1">Quantidade</Typography>
                            <Typography variant="body1">Unidade</Typography>
                            <Typography variant="body1">Preço</Typography>
                            <Typography variant="body1">Preço Total</Typography>
                        </Box>

                        {/* Linhas da Tabela */}
                        {Array.isArray(custo.defensivos) && custo.defensivos.map((item, id) => (
                            <Box
                                key={id}
                                display="grid"
                                gridTemplateColumns={isMobile ? "repeat(5, minmax(100px, 1fr))" : "repeat(5, 1fr)"}
                                padding="10px 0"
                                borderBottom={theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" :"1px solid rgba(205, 204, 204, 0.53)" }
                                color={colors.grey[300]}
                            >
                                <Typography variant="body2">{item.name}</Typography>
                                <Typography variant="body2">{item.quantity}</Typography>
                                <Typography variant="body2">{item.unit}</Typography>
                                <Typography variant="body2">R$ {item.price.toFixed(2)}</Typography>
                                <Typography variant="body2">R$ {item.totalValue.toFixed(2)}</Typography>
                            </Box>
                        ))}
                        {/* Linha de Total Geral */}
                        <Box
                            display="grid"
                            gridTemplateColumns={isMobile ? "repeat(5, minmax(100px, 1fr))" : "repeat(5, 1fr)"}
                            padding="12px 0"
                            marginTop="10px"
                            borderTop={`2px solid ${colors.primary[400]}`}
                            fontWeight="bold"
                            color={colors.grey[100]}
                        >
                            <Typography variant="body2" gridColumn="span 4" textAlign="right" marginRight={"5px"}>
                                Total - Defensivos:
                            </Typography>
                            <Typography variant="body2">
                                R$ {custo.defensivos?.[0]?.total|| "0,00"}
                            </Typography>
                        </Box>
                    </Box>
                    {/*Tabela Categoria Operações  */}
                    <Box
                        gridColumn="span 12"
                        backgroundColor={colors.primary[400]}
                        display="grid"
                        padding="25px 35px 30px 35px"
                        height="auto"
                        marginTop={isMobile ?"1050px" :"240px"}
                        minHeight={isMobile ?"400px" :"260px"} 
                        sx={{
                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",
                            overflowX: "auto",
                        }}
                        color={colors.mygreen[800]}
                    >
                        <Typography variant="h3" 
                            sx={{
                                marginBottom: "20px"
                            }}
                        >
                            Operações
                        </Typography>
                        {/* Cabeçalho da Tabela */}
                        <Box
                            display="grid"
                            gridTemplateColumns={isMobile ? "repeat(5, minmax(100px, 1fr))" : "repeat(5, 1fr)"}
                            padding="10px 0"
                            fontWeight="bold"
                            color={colors.grey[100]}
                            sx={{
                                borderBottom: `2px solid ${colors.mygreen[800]}`,
                            }}                            
                        >
                            <Typography variant="body1">Nome</Typography>
                            <Typography variant="body1">Quantidade</Typography>
                            <Typography variant="body1">Unidade</Typography>
                            <Typography variant="body1">Preço</Typography>
                            <Typography variant="body1">Preço Total</Typography>
                        </Box>

                        {/* Linhas da Tabela */}
                        {Array.isArray(custo.operacoes) && custo.operacoes.map((item, index) => (
                            <Box
                                key={index}
                                display="grid"
                                gridTemplateColumns={isMobile ? "repeat(5, minmax(100px, 1fr))" : "repeat(5, 1fr)"}
                                padding="10px 0"
                                borderBottom={theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" :"1px solid rgba(205, 204, 204, 0.53)" }
                                color={colors.grey[300]}
                            >
                                <Typography variant="body2">{item.name}</Typography>
                                <Typography variant="body2">{item.quantity}</Typography>
                                <Typography variant="body2">{item.unit}</Typography>
                                <Typography variant="body2">R$ {item.price.toFixed(2)}</Typography>
                                <Typography variant="body2">R$ {item.totalValue.toFixed(2)}</Typography>
                            </Box>
                        ))}
                        {/* Linha de Total Geral */}
                        <Box
                            display="grid"
                            gridTemplateColumns={isMobile ? "repeat(5, minmax(100px, 1fr))" : "repeat(5, 1fr)"}
                            padding="12px 0"
                            marginTop="10px"
                            borderTop={`2px solid ${colors.primary[400]}`}
                            fontWeight="bold"
                            color={colors.grey[100]}
                        >
                            <Typography variant="body2" gridColumn="span 4" textAlign="right" marginRight={"5px"}>
                                Total - Operações:
                            </Typography>
                            <Typography variant="body2">
                                R$ {custo.operacoes?.[0]?.total|| "0,00"} 
                            </Typography>
                        </Box>
                    </Box>
                    {/*Tabela Descritivo */}
                    <Box
                        gridColumn={isMobile ? "span 12" : "span 6"}
                        backgroundColor={colors.primary[400]}
                        display="grid"
                        padding="25px 35px 30px 35px"
                        height="auto"
                        marginTop={isMobile ?"1300px" :"360px"}
                        minHeight={isMobile ?"400px" :"260px"} 
                        //maxWidth={"600px"} 
                        sx={{
                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",
                            overflowX: "auto",
                        }}
                    >
                        <Typography variant="h3" 
                            sx={{
                                marginBottom: "20px"
                            }}
                            color={colors.mygreen[800]}
                        >
                            Descritivo
                        </Typography>
                        {/* Cabeçalho da Tabela */}
                        <Box
                            display="grid"
                            gridTemplateColumns={isMobile ? "repeat(3, minmax(100px, 1fr))" : "repeat(3, 1fr)"}
                            padding="10px 0"
                            fontWeight="bold"
                            color={colors.grey[100]}
                            sx={{
                                borderBottom: `2px solid ${colors.mygreen[800]}`,
                            }}                            
                        >
                            <Typography variant="body1">Categoria</Typography>
                            <Typography variant="body1">Total</Typography>
                            <Typography variant="body1">Porcentagem</Typography>
                        </Box>

                        {/* Linhas da Tabela */}
                        {Array.isArray(custo.descritivo) && custo.descritivo.map((item, index) => (
                            <Box
                                key={index}
                                display="grid"
                                gridTemplateColumns={isMobile ? "repeat(3, minmax(100px, 1fr))" : "repeat(3, 1fr)"}
                                padding="10px 0"
                                borderBottom={theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" :"1px solid rgba(205, 204, 204, 0.53)" }
                                color={colors.grey[300]}
                            >
                                <Typography variant="body2">{item.category}</Typography>
                                <Typography variant="body2">{item.value}</Typography>
                                <Typography variant="body2">{item.percentage}</Typography>
                            </Box>
                        ))}
                        {/* Linha de Total Geral */}
                        <Box
                            display="grid"
                            gridTemplateColumns={isMobile ? "repeat(5, minmax(100px, 1fr))" : "repeat(5, 1fr)"}
                            padding="12px 0"
                            marginTop="10px"
                            borderTop={`2px solid ${colors.primary[400]}`}
                            fontWeight="bold"
                            //marginRight={"600px"}
                            color={colors.grey[100]}
                        >
                            <Typography variant="body2" gridColumn="span 4" textAlign="right" marginRight={"5px"}>
                                Total:
                            </Typography>
                            <Typography variant="body2">
                                R$ {custo.custoTotal} 
                            </Typography>
                            <Typography variant="body2" gridColumn="span 4" textAlign="right" marginRight={"5px"}>
                                Custo Financeiro (9,5%):
                            </Typography>
                            <Typography variant="body2">
                                R$ {custo.custoFinanceiro}
                            </Typography>
                            <Typography variant="body2" gridColumn="span 4" textAlign="right" marginRight={"5px"}>
                                Seguro (2%):
                            </Typography>
                            <Typography variant="body2">
                                R$ {custo.seguro}
                            </Typography>
                            <Typography variant="body2" gridColumn="span 4" textAlign="right" marginRight={"5px"}>
                                Custo médio por hectare:
                            </Typography>
                            <Typography variant="body2">
                                R$ {custo.custoMedio}
                            </Typography>
                            <Typography variant="body2" gridColumn="span 4" textAlign="right" marginRight={"5px"}>
                                {custo.type === "Realizado" ? "Produtividade Realizada (sacos / ha):" : "Produtividade Estimada (sacos / ha):"}
                            </Typography>
                            <Typography variant="body2">
                                R$ {custo.prod}
                            </Typography>
                            <Typography variant="body2" gridColumn="span 4" textAlign="right" marginRight={"5px"}>
                                {custo.type === "Realizado" ? "Preço de Custo Realizado (R$ / saco):" : "Preço de Custo Estimado (R$ / saco):"}
                            </Typography>
                            <Typography variant="body2">
                                R$ {custo.precoCusto}
                            </Typography>
                            <Typography variant="body2" gridColumn="span 4" textAlign="right" marginRight={"5px"}>
                                Custo Total:
                            </Typography>
                            <Typography variant="body2">
                                R$ {}
                            </Typography>
                        </Box>
                    </Box>
                    {/* Tabela Rentabilidade */}
                    <Box
                        gridColumn={isMobile ? "span 12" : "span 6"}
                        backgroundColor={colors.primary[400]}
                        display="grid"
                        padding="25px 35px 30px 35px"
                        height="auto"
                        marginTop={isMobile ?"1550px" :"360px"}
                        minHeight={isMobile ?"400px" :"260px"} 
                        sx={{
                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",
                            overflowX: "auto",
                        }}
                    >
                        <Typography variant="h3" 
                            sx={{
                                marginBottom: "20px"
                            }}
                            color={colors.mygreen[800]}
                        >
                            Rentabilidade
                        </Typography>
                        {/* Linhas da Tabela */}
                        {Array.isArray(custo.rentabilidade) && custo.rentabilidade.map((item, index) => (
                            <Box
                                key={index}
                                display="grid"
                                gridTemplateColumns={isMobile ? "1fr 1fr" : "2fr 1fr"}
                                padding="10px 0px"
                                borderBottom={theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" :"1px solid rgba(205, 204, 204, 0.53)" }
                                color={colors.grey[300]}
                            >
                                <Typography variant="body2">{item.name}</Typography>
                                <Typography variant="body2">{item.value}</Typography>
                            </Box>
                        ))}
                        {/* Rentabildiade TOTAL LAIR */}
                        <Box
                            display="grid"
                            gridTemplateColumns={isMobile ? "repeat(5, minmax(100px, 1fr))" : "repeat(5, 1fr)"}
                            padding="12px 0"
                            marginTop="10px"
                            borderTop={`2px solid ${colors.primary[400]}`}
                            fontWeight="bold"
                            //marginRight={"600px"}
                            color={colors.grey[100]}
                        >
                            <Typography variant="body2" gridColumn="span 4" textAlign="right" marginRight={"5px"}>
                                {custo.type === "Realizado" ? "Rentabilidade Realizada (LAIR):" : "Rentabilidade Esperada (LAIR):"}
                            </Typography>
                            <Typography variant="body2">
                                {custo.rentabilidadeLair + "%"}
                            </Typography>
                        </Box>
                        {Array.isArray(custo.rentabilidadeImposto) && custo.rentabilidadeImposto.map((item, index) => (
                            <Box
                                key={index}
                                display="grid"
                                gridTemplateColumns={isMobile ? "1fr 1fr" : "2fr 1fr"}
                                padding="10px 0px"
                                borderBottom={theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" :"1px solid rgba(205, 204, 204, 0.53)" }
                                color={colors.grey[300]}
                            >
                                <Typography variant="body2">{item.name}</Typography>
                                <Typography variant="body2">{item.value}</Typography>
                            </Box>
                        ))}
                         {/* Rentabildiade TOTAL */}
                         <Box
                            display="grid"
                            gridTemplateColumns={isMobile ? "repeat(5, minmax(100px, 1fr))" : "repeat(5, 1fr)"}
                            padding="12px 0"
                            marginTop="10px"
                            borderTop={`2px solid ${colors.primary[400]}`}
                            fontWeight="bold"
                            //marginRight={"600px"}
                            color={colors.grey[100]}
                        >
                            <Typography variant="body2" gridColumn="span 4" textAlign="right" marginRight={"5px"}>
                            {custo.type === "Realizado" ? "Rentabilidade Realizada:" : "Rentabilidade Esperada:"}
                            </Typography>
                            <Typography variant="body2">
                             {custo.rentabilidadeFinal + "%"}
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        gridColumn="span 6"
                        //backgroundColor={colors.primary[400]}
                        display="grid"
                        padding="25px 35px 30px 35px"
                        height="auto"
                        marginTop={isMobile ? "1750px":"480px"}
                        minHeight={"10px"}
                        sx={{
                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",
                            overflowX: "auto",
                        }}
                    >
                    </Box>
                </Box>
                )}

            </Box>
        </Box>
    );
};

const checkoutSchema = yup.object().shape({
  safra: yup.number().required('Campo de preenchimento obrigatório'),
});

export default TotalPage;
