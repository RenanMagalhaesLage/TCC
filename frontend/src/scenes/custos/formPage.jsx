import React, { useState, useEffect, useCallback  } from 'react';
import { Box, Button, TextField, Typography, useTheme, Autocomplete, useMediaQuery,IconButton } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate,useParams } from 'react-router-dom';
import { Formik } from "formik";
import { tokens } from "../../theme";
import * as yup from "yup";
import Header from "../../components/Header";
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage'; 
import { NumericFormat } from 'react-number-format';

const CustosForm = () => {
  const token = secureLocalStorage.getItem('auth_token');
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isSmallDevice = useMediaQuery("(max-width: 800px)"); 
  const [gleba,setGleba] = useState(null);
  const [safraOptions, setSafraOptions] = useState([]);
  const [glebaOptions, setGlebaOptions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); 


  const fields = [
    { name: "unit", label: "Unidade", type: "text" },
    { name: "date", label: "Data de Validade", type: "date" },
    { name: "quantity", label: "Quantidade", type: "number" },
    //{ name: "price", label: "Preço", type: "number" },
    //{ name: "totalValue", label: "Valor total", type: "number", disabled: true },
   
  ];

  const categoryOptions = [
    "Administrativo",
    "Arrendamento",
    "Semente",
    "Corretivos e Fertilizantes",
    "Defensivos",
    "Operações",
  ]
  
  useEffect(() => {
    const storedUser = secureLocalStorage.getItem('userData'); 
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  },[]);  

  useEffect(() => {
    if (userData && userData.email) {
      const fetchCustosData = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/safras-by-user`, {
              params: { email: userData.email }, headers: {Authorization: `Bearer ${token}`}
            });
            const safraData = response.data
            .filter(safra => safra.status === false)
            .map(safra => ({
              id: safra.id,
              name: `${safra.name} - ${safra.crop}`
            }));
            setSafraOptions(safraData);

            if(id){
              const fetchSafraData = async () => {
                try {
                  const response = await axios.get(`http://localhost:3000/glebas/${id}`, {
                    headers: {Authorization: `Bearer ${token}`}
                  });
                  const { gleba, propriedade, owner } = response.data;
                  setPropertie(propriedade);
                  setLoading(false); 
                } catch (error) {
                  if (error.response?.status === 401) {
                    alert('Sessão expirada. Faça login novamente.');
                    secureLocalStorage.removeItem('userData');
                    secureLocalStorage.removeItem('auth_token');
                    window.location.href = '/login';
                  } else {
                    console.error("Erro ao buscar dados da gleba:", error);
                  }
                  setLoading(false); 
                }
            };
            fetchSafraData();
          }

        } catch (error) {
          if (error.response?.status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            secureLocalStorage.removeItem('userData');
            secureLocalStorage.removeItem('auth_token');
            window.location.href = '/login';
          } else {
            console.error('Erro ao buscar custos:', error);
          }
        }finally {
          setLoading(false);
        }
      };
      fetchCustosData();
    }
  }, [userData]);

  const calculateTotalValue = (quantity, price) =>{
    return quantity * price;
  }

  const initialValues = {
    name: "",
    unit: "",
    quantity: "",
    price: "",
    category: "",
    totalValue: "",
    date: "",
    note: "",
    safra: "",
    gleba: ""
  };  

  const NumericFormatCustom = React.forwardRef(function NumericFormatCustom(props, ref) {
    const { onChange, ...other } = props;
  
    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
        thousandSeparator
        valueIsNumericString
        prefix="R$ "
      />
    );
  });

  const fetchGlebaData = useCallback(async (safraId) => {
    try {
      const response = await axios.get(`http://localhost:3000/glebas-by-safra`, {
        params: { id: safraId }, headers: {Authorization: `Bearer ${token}`}
      });
      const glebaData = response.data.map(gleba => ({
        id: gleba.id,
        name: `${gleba.name} - ${gleba.property.name}`
      }));
      setGlebaOptions(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        secureLocalStorage.removeItem('userData');
        secureLocalStorage.removeItem('auth_token');
        window.location.href = '/login';
      } else {
        console.error('Erro ao buscar dados da safra:', error);
      }
      
    }
  }, []);
  

  const navigate = useNavigate(); 
  const handleFormSubmit = async (values) => {
    try {
      const response = await axios.post("http://localhost:3000/custos", {
        
        email: userData.email,
        safraId: values.safra,
        glebaId: values.gleba,
        name: values.name,
        category: values.category,
        unit: values.unit,
        quantity: values.quantity,
        price: values.price,
        totalValue: values.totalValue,
        date: values.date || null,
        note: values.note || null,
      }, {headers: {Authorization: `Bearer ${token}`}} );
      if (response.status === 201) {  
        navigate(`/custos?message=${encodeURIComponent("1")}`);
      }
      
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        secureLocalStorage.removeItem('userData');
        secureLocalStorage.removeItem('auth_token');
        window.location.href = '/login';
      } else {
        console.error("Erro ao criar custo: " , error);
      }
      
    }
  };

  if (loading) {
    return <Typography variant="h4" fontWeight="bold" sx={{ml: "50px"}}>Carregando...</Typography>;
  }
  
  return (
    <Box m="20px">
      <Header title="Adicionar Custo" subtitle="Preencha os campos para que seja cadastrado um custo" />
      <Typography variant="body1" sx={{ mb: "20px", color: theme.palette.mode === 'dark' ? colors.primary[100] : colors.grey[600] }}>
        <IconButton sx={{ p: 0, mr: 1 }}>
          <InfoIcon fontSize="small" />
        </IconButton>
            Verifique o seu estoque antes de adicionar um custo.
      </Typography>
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
 
            >
                {gleba ? (
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Talhão"
                    value={gleba.name}
                    disabled 
                    sx={{ gridColumn: "span 2" }}
                  />
                ) : (
                  <Autocomplete
                      disablePortal
                      id="safras"
                      options={safraOptions} 
                      getOptionLabel={(option) => option.name || ""} 
                      name="safra"
                      value={
                          values.safra 
                            ? safraOptions.find((option) => option.id === values.safra) 
                            : null
                      } 
                      onChange={(event, value) => {
                        setFieldValue('safra', value?.id || null);
                
                        if (value) {
                          fetchGlebaData(value.id); 
                        }
                      }}                      
                      onBlur={handleBlur} 
                      sx={{ gridColumn: isSmallDevice ? "span 4" : "span 2" }}
                      renderInput={(params) => (
                          <TextField 
                              {...params} 
                              label="Safra"
                              variant="filled"
                              name="safra"
                              error={!!touched.safra && !!errors.safra}
                              helperText={touched.safra && errors.safra}
                              onBlur={handleBlur} 
                          />
                      )}
                  />
                )}

                <Autocomplete
                  disablePortal
                  id="glebas"
                  options={glebaOptions} 
                  getOptionLabel={(option) => option.name || ""} 
                  name="gleba"
                  value={
                    values.gleba 
                    ? glebaOptions.find((option) => option.id === values.gleba) 
                    : null
                  } 
                  onChange={(event, value) => setFieldValue('gleba', value?.id || null)} 
                  onBlur={handleBlur} 
                  sx={{ gridColumn: isSmallDevice ? "span 4" : "span 2" }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Talhão"
                      variant="filled"
                      name="gleba"
                      error={!!touched.gleba && !!errors.gleba}
                      helperText={touched.gleba && errors.gleba}
                      onBlur={handleBlur} 
                      />
                  )}
                  noOptionsText="Nenhum talhão disponível"
                  />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Nome do Custo"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.name || ""}
                  name="name"
                  error={!!touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                  sx={{ gridColumn: isSmallDevice ? "span 4" : "span 1" }}
                  />



                  <Autocomplete
                    disablePortal
                    id="categories"
                    options={categoryOptions}
                    name="category"
                    value={values.category || null} 
                    onChange={(event, value) => setFieldValue('category', value)} 
                    onBlur={handleBlur} 
                    sx={{ gridColumn: isSmallDevice ? "span 4" : "span 1" }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Categoria"
                        variant="filled"
                        name="category"
                        error={!!touched.category && !!errors.category}
                        helperText={touched.category && errors.category}
                        onBlur={handleBlur} 
                      />
                    )}
                    noOptionsText="Não Encontrado"
                  />
                  

                {fields.map(({ name, label, type, disabled, }) => (
                  <TextField
                    key={name}
                    fullWidth
                    variant="filled"
                    type={type}
                    label={label}
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      if (name === "quantity" || name === "price") {
                        const total = calculateTotalValue(
                          name === "quantity" ? e.target.value : values.quantity,
                          name === "price" ? e.target.value : values.price
                        );
                        setFieldValue("totalValue", total);
                      }
                    }}
                    InputProps={{
                      inputComponent: name === "price" ? NumericFormatCustom: "",
                    }}
                    value={values[name] || ""}
                    name={name}
                    disabled={disabled}
                    error={touched[name] && Boolean(errors[name])}
                    helperText={touched[name] && errors[name]}
                    sx={{ gridColumn: isSmallDevice ? "span 4" : "span 1" }}
                    InputLabelProps={type === "date" ? { shrink: true } : {}}
                  />
                ))}   
                <TextField
                    label="Preço"
                    variant="filled"
                    value={values.price || ""}
                    onBlur={handleBlur} 
                    onChange={(e) => {
                      handleChange(e);
                      setFieldValue("totalValue", calculateTotalValue(e.target.value, values.quantity));
                    }} 
                    name="price"
                    error={!!touched.price && !!errors.price}
                    helperText={touched.price && errors.price}
                    id="formatted-numberformat-input"
                    InputProps={{
                      inputComponent: NumericFormatCustom,
                    }}
                    sx={{ gridColumn: isSmallDevice ? "span 4" : "span 1" }}
                  />

                  <TextField
                    label="Valor Total"
                    variant="filled"
                    value={values.totalValue || ""}
                    onBlur={handleBlur} 
                    onChange={(e) => {
                      setFieldValue("totalValue", calculateTotalValue(values.quantity, values.price));
                      handleChange(e);
                      
                    }}                    
                    name="totalValue"
                    error={!!touched.totalValue && !!errors.totalValue}
                    helperText={touched.totalValue && errors.totalValue}
                    
                    InputProps={{
                      inputComponent: NumericFormatCustom,
                    }}
                    disabled
                    sx={{ gridColumn: isSmallDevice ? "span 4" : "span 1" }}
                  />
                <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Observação"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.note || ""}
                    multiline
                    rows={5}
                    name="note"
                    error={!!touched.note && !!errors.note}
                    helperText={touched.note && errors.note}
                    sx={{ gridColumn: isSmallDevice ? "span 4" : "span 2" }}
                  />       
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button 
                    type="submit"
                    sx={{ 
                        backgroundColor: colors.mygreen[400],
                        color: colors.grey[100],
                        fontSize: "12px",
                        fontWeight: "bold",
                          "&:hover": {
                              backgroundColor: colors.grey[700], 
                          },
                    }} 
                    variant="contained">
                Adicionar
              </Button>
            </Box>
            {/*Object.keys(errors).length > 0 && (
                <Typography color="error" sx={{ mt: 2 }}>
                Por favor, corrija os erros acima.
                </Typography>
            )*/}
          </form>
        )}
      </Formik>
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  name: yup.string().required("Campo de preenchimento obrigatório"),
  category: yup.string().required("Campo de preenchimento obrigatório"),
  unit: yup.string().required("Campo de preenchimento obrigatório"),
  quantity: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
  price: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
  totalValue: yup.number().required("Campo de preenchimento obrigatório").positive("Deve ser um número positivo"),
  //date: yup.date().required("Campo de preenchimento obrigatório").typeError("Deve ser uma data válida"),
  date: yup.date(),  
  note: yup.string(),
  safra: yup.string().required("Campo de preenchimento obrigatório"),
  gleba: yup.string().required("Campo de preenchimento obrigatório"),
});
export default CustosForm;
