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

const StorageForm = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isSmallDevice = useMediaQuery("(max-width: 800px)"); 
  const [storageProperty, setStorageProperty] = useState("");
  const [properties, setProperties] = useState([]);
  const [storageItem, setStorageItem] = useState("");
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
      const fetchStorageData = async () => {
        try {
          const responseStorage = await axios.get(`http://localhost:3000/storage-by-id`,{
            params: { id: id }
          });
          setStorageItem(responseStorage.data);

          const responseProperties = await axios.get(`http://localhost:3000/user`, {
            params: { email: userData.email }
          });
          const propertyData = responseProperties.data.map(property => ({
            id: property.id,           
            name: property.name      
          }));
          setProperties(propertyData);

        } catch (err) {
          console.error('Erro ao buscar estoque:', err);  
        }finally {
          setLoading(false);
        }
      };
      fetchStorageData();
    }
  }, [userData]);

  const calculateTotalValue = (quantity, price) =>{
    return quantity * price;
  }

  const initialValues = {
    name: storageItem.name || "",
    unit: storageItem.unit || "",
    quantity: storageItem.quantity || "",
    price: storageItem.price || "",
    category: storageItem.category || "",
    totalValue: storageItem.totalValue || "",
    date: storageItem.expirationDate || "",
    note: storageItem.note || "",
    property: storageItem.propertyId || "",
    storedLocation: storageItem.storedLocation || "",
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
  

  const navigate = useNavigate(); 
  const handleFormSubmit = async (values) => {
    try {
      const response = await axios.put("http://localhost:3000/storage", {
        id: id,
        email: userData.email,
        propertyId: values.property,
        storedLocation: values.storedLocation || null,
        name: values.name,
        category: values.category,
        unit: values.unit,
        quantity: values.quantity,
        price: values.price,
        totalValue: values.totalValue,
        date: values.date || null,
        note: values.note || null
      });
      if (response.status === 200) {  
        navigate(`/estoque?message=${encodeURIComponent("2")}`);
      }
      
    } catch (error) {
      console.error("Erro ao editar item no estoque: " , error);
    }
  };

  if (loading) {
    return <Typography variant="h4" fontWeight="bold" sx={{ml: "50px"}}>Carregando...</Typography>;
  }
  
  return (
    <Box m="20px">
      <Header title="Editar Item em Estoque" subtitle="Edite as informações do item em estoque" />
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
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Nome do Item"
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
                id="properties"
                options={properties}
                getOptionLabel={(option) => option.name || ""}
                name="property"
                value={
                  values.property
                  ? properties.find((option) => option.id === values.property) 
                  : null
                } 
                onChange={(event, value) => setFieldValue('property', value?.id || null)} 
                onBlur={handleBlur} 
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Propriedade"
                    variant="filled"
                    name="property"
                    error={!!touched.property && !!errors.property }
                    helperText={touched.property &&  errors.property }
                    onBlur={handleBlur} 
                  />
                )}
                sx={{ gridColumn: isSmallDevice ? "span 4" : "span 2" }}
                noOptionsText="Não Encontrado"
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Localização Referência"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.storedLocation || ""}
                name="storedLocation"
                error={!!touched.storedLocation && !!errors.storedLocation}
                helperText={touched.storedLocation && errors.storedLocation}
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
                sx={{ gridColumn: isSmallDevice ? "span 4" : "span 1" }}
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
                    InputLabelProps={type === "date" ? { shrink: true } : {}}
                    sx={{ gridColumn: isSmallDevice ? "span 4" : "span 1" }}
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
                  sx={{ gridColumn: isSmallDevice ? "span 4" : "span 1" }}
                  disabled
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
  property: yup.string().required("Campo de preenchimento obrigatório"),
  storedLocation: yup.string(),
});
export default StorageForm;
