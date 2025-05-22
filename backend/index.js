const express = require("express");
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');

//Configurando autenticação Google
const {OAuth2Client} = require('google-auth-library');
require('dotenv').config();
const client = new OAuth2Client();
//const nodemailer = require('nodemailer');
const verifyToken = require('./middlewares/verifyToken');

const app = express();
const connection = require("./database/database");
const bodyParser = require("body-parser");
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:5173', // ou a porta onde seu front-end está rodando
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

/*-------------------------------
            Controllers
---------------------------------*/
const storageController = require("./controller/StorageController"); 
const custoController = require("./controller/CustoController");
const inviteController = require("./controller/InviteController");
const propertyController = require("./controller/PropertyController");
const glebaController = require("./controller/GlebaController");
const safraController = require("./controller/SafraController");
const dashboardController = require("./controller/DashboardController");

/*-------------------------------
            Models
---------------------------------*/
const User = require("./database/User");
const Property = require("./database/Property");
const UserProperty = require("./database/UserProperty");
const Gleba = require("./database/Gleba");
const Safra = require("./database/Safra");
const Invite = require("./database/Invite");
const Custo = require("./database/Custo");
const SafraGleba = require("./database/SafraGleba");
const StorageItem = require("./database/StorageItem");

/*--------------------------------
    Relacionamentos dos Models
----------------------------------*/
User.belongsToMany(Property, { through: UserProperty, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Property.belongsToMany(User, { through: UserProperty, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Safra.belongsToMany(Gleba, {
    through: SafraGleba,  
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Gleba.belongsToMany(Safra, {
    through: SafraGleba,  
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Property.hasMany(StorageItem, {
    foreignKey: 'propertyId',
    as: 'storage_items',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'  
});

StorageItem.belongsTo(Property, {
    foreignKey: 'propertyId',
    as: 'property',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'  
});

Property.hasMany(Gleba, { 
    foreignKey: 'propertyId',
    as: 'glebas',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'  
});

Gleba.belongsTo(Property,  {
    foreignKey: 'propertyId',
    as: 'property',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE' 
});

Safra.hasMany(Custo,{
    foreignKey: 'safraId',
    as: 'custos',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE' 
});

Custo.belongsTo(Safra,{
    foreignKey: 'safraId',
    as: 'safra',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE' 
});

Gleba.hasMany(Custo,{
    foreignKey: 'glebaId',
    as: 'custos',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE' 
});

Custo.belongsTo(Gleba,{
    foreignKey: 'glebaId',
    as: 'gleba',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE' 
});

Invite.belongsTo(Property, {
    foreignKey: 'propertyId', 
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE' 
});

Property.hasMany(Invite, {
    foreignKey: 'propertyId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'  
});


/*
const syncModels = async () => {
    await connection.sync({ force: true }); // Cuidado: isso irá apagar dados existentes
};

syncModels().then(() => {
    console.log("Tabelas sincronizadas");
}).catch((error) => {
    console.error("Erro ao sincronizar tabelas:", error);
});*/


connection
    .authenticate()
    .then(() =>{
        console.log("Conexão feita com o banco de dados!")
    })
    .catch((msgErro) =>{
        console.log(msgErro)
    })


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.json());
const port = 3000;

/*
app.get("/publica",(req,res) =>{
    res.json({message:"rota publica"});
})

app.post("/protegida", verificaTokens,async(req,res) =>{
    const user = req.user
    //Dados que necessito
    const userName = req.user.name
    const userEmail = req.user.email
    const userPicture = req.user.picture
    try {
        const existingUser = await User.findOne({ where: { email: userEmail } });

        if (!existingUser) {
           const newUser = await User.create({
                name: userName,
                email: userEmail,
                picture: userPicture,
            });
            //console.log('Usuário criado:', newUser);
            return res.json({
                message: "Usuário criado com sucesso",
                user: newUser,
                name: userName,
                email: userEmail,
                picture: userPicture,
            });
        }else{
            return res.json({
                message: "Usuário ja existente",
                name: userName,
                email: userEmail,
                picture: userPicture,
            });
        }

    } catch (error) {
        console.error('Erro ao processar a solicitação:', error);
        return res.status(500).json({ message: "Erro ao processar a solicitação" });
    }
    //node --watch index.js
});*/

/*  Rota para --> VALIDAR USUÁRIO*/
app.post("/login", verifyToken,async(req,res) =>{
    const user = req.user
    //Dados que necessito
    const userName = req.user.name
    const userEmail = req.user.email
    const userPicture = req.user.picture
    try {
        const existingUser = await User.findOne({ where: { email: userEmail } });

        if (!existingUser) {
           const newUser = await User.create({
                name: userName,
                email: userEmail,
                picture: userPicture,
            });
            //console.log('Usuário criado:', newUser);
            return res.json({
                message: "Usuário criado com sucesso",
                user: newUser,
                name: userName,
                email: userEmail,
                picture: userPicture,
            });
        }else{
            return res.json({
                message: "Usuário ja existente",
                name: userName,
                email: userEmail,
                picture: userPicture,
            });
        }

    } catch (error) {
        console.error('Erro ao processar a solicitação:', error);
        return res.status(500).json({ message: "Erro ao processar a solicitação" });
    }
    //node --watch index.js
});

//Usando os controllers
app.use("/", storageController);
app.use("/", custoController);
app.use("/", inviteController);
app.use("/", propertyController);
app.use("/", glebaController);
app.use("/", safraController);
app.use("/", dashboardController);

/* Rota para --> BUSCA TODOS OS DADOS DO USER - DADO DETERMINADO EMAIL 
   Retorno: Propriedades, Glebas, Safras e Custos associados ao user */
app.get('/user', verifyToken, async (req, res) => {
    const userEmail = req.user.email

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        /* Busca todas as propriedades associadas ao usuário e seus níveis de acesso*/
        const userProperties = await UserProperty.findAll({
            where: { userId: user.id },
            attributes: ['propertyId', 'access']
        });
        
        const propertyIds = userProperties.map(up => up.propertyId);
        const access = userProperties.map(up => up.access);
        
        const properties = await Property.findAll({
            where: {
                id: propertyIds
            },
            include: {
                model: Gleba, as: 'glebas', 
                include: {
                    model: Safra, as: 'safras',
                    include:{
                        model: Custo, as: 'custos'
                    }  
                }
            }
        });
        
        const propertiesWithAccess = properties.map((property, index) => ({
            ...property.toJSON(),
            access: access[index]
        }));
        
        if (properties.length === 0) {
            return res.status(404).json({ message: 'Nenhuma propriedade cadastrada para este usuário.' });
        }
        const result = propertiesWithAccess.map(property => {
            const glebas = (property.glebas || []).map(gleba => {
                const safras = (gleba.safras || []).map(safra => {
                    const custos = safra.custos || [];
                    return {
                        ...safra,
                        custos
                    };
                });
        
                return {
                    ...gleba,
                    safras
                };
            });
        
            return {
                ...property,
                glebas
            };
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Erro ao buscar custos do usuário:', error);
        return res.status(500).json({ error: 'Erro ao buscar custos do usuário' });
    }
});

app.listen(port,()=>{
    console.log(`Servidor rodando na porta ${port}`);
})


/*
app.get("/",(req,res) =>{
    res.send("Bem vinde");
})

app.listen(8080,()=>{
    console.log("App rodando na porta 8080");
})*/