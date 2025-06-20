import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, useTheme, Autocomplete, useMediaQuery } from "@mui/material";
import { useNavigate,useParams } from 'react-router-dom';
import { Formik } from "formik";
import { tokens } from "../../theme";
import * as yup from "yup";
import Header from "../../components/Header";
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage'; 
import { NumericFormat } from 'react-number-format';

const CustosEditPage = () => {
  const token = secureLocalStorage.getItem('auth_token');
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isSmallDevice = useMediaQuery("(max-width: 800px)"); 
  const [property, setProperty] = useState("");
  const [gleba, setGleba] = useState("");
  const [safra, setSafra] = useState("");
  const [custo, setCusto] =useState("");
  const [safraOptions, setSafraOptions] = useState([]);
  const [glebaOptions, setGlebaOptions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); 


  const fields = [
    { name: "unit", label: "Unidade", type: "text" },
    { name: "date", label: "Data", type: "date" },
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
          const response = await axios.get(`http://localhost:3000/custos`,{
            params: { id: id}, headers: {Authorization: `Bearer ${token}`}
          });
          const custo = response.data;
          const safra = response.data.safra;
          setCusto(custo);
          setSafra(safra);
          setProperty(property);
          setLoading(false);

          const glebaData = safra.glebas.map((gleba) => ({
            id: gleba.id,
            name: `${gleba.name} - ${gleba.property.name}`,
          }));
          setGlebaOptions(glebaData);

        } catch (erro) {
            console.error('Erro ao buscar dados do custo:', erro);  
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

  const initialValues = custo ?{
    name: custo.name || "",
    unit: custo.unit || "",
    quantity: custo.quantity || "",
    price: custo.price || "",
    category: custo.category || "",
    totalValue: custo.totalValue|| "",
    date: custo.expirationDate || "",
    note: custo.note || "",
    safra: custo.safraId || "",
    gleba: custo.glebaId || ""
  } : {};  

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

  const navigate = useNavigate(); 

  const handleFormSubmit = async (values) => {
    try {
      const response = await axios.put(`http://localhost:3000/custos`, {
        id: id,
        email: userData.email,
        safraId: values.safra,
        glebaId: values.gleba,
        name: values.name,
        category: values.category,
        unit: values.unit,
        quantity: values.quantity,
        price: values.price,
        totalValue: values.totalValue,
        date: values.date,
        note: values.note
      },{headers: {Authorization: `Bearer ${token}`}});
      if (response.status === 200) {  
        navigate(`/custos?message=${encodeURIComponent("2")}`);
      }
      
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        secureLocalStorage.removeItem('userData');
        secureLocalStorage.removeItem('auth_token');
        window.location.href = '/login';
      }else {
        console.error("Erro ao editar custo: " , error);
      }
    }
  };

  if (loading) {
    return <Typography variant="h4" fontWeight="bold" sx={{ml: "50px"}}>Carregando...</Typography>;
  }
  
  return (
    <Box m="20px">
      <Header title="Editar Custo" subtitle="Edite as informações do custo" />
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
              gridTemplateColumns="repeat(4, 1fr)"
            >
                {safra ? (
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Safra"
                    value={safra.name + " - " + safra.cultivo}
                    disabled 
                    sx={{ gridColumn: isSmallDevice ? "span 4" : "span 2" }}
                    
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
                      onChange={(event, value) => setFieldValue('safra', value?.id || null)} 
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
                  sx={{ gridColumn: isSmallDevice ? "span 4" : "span 2" }}
                  noOptionsText="Nenhum talhão escontrado"
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
                  sx={{ gridColumn: isSmallDevice ? "span 4" : "span 2" }}
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
                Salvar
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
  date: yup.date(),  
  note: yup.string(),
  safra: yup.string().required("Campo de preenchimento obrigatório"),
  gleba: yup.string().required("Campo de preenchimento obrigatório"),
});
export default CustosEditPage;
