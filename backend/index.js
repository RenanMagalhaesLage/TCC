const express = require("express");

//Configurando autenticação Google
const {OAuth2Client} = require('google-auth-library');
require('dotenv').config();
const client = new OAuth2Client();
//const nodemailer = require('nodemailer');

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
            Models
---------------------------------*/
const User = require("./database/User");
const Property = require("./database/Property");
const UserProperty = require("./database/UserProperty");
const Gleba = require("./database/Gleba");
const Safra = require("./database/Safra");
const Invite = require("./database/Invite");

/*--------------------------------
    Relacionamentos dos Models
----------------------------------*/
User.belongsToMany(Property, { through: UserProperty, onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Property.belongsToMany(User, { through: UserProperty, onDelete: 'CASCADE', onUpdate: 'CASCADE' });

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

Gleba.hasMany(Safra, {
    foreignKey: 'glebaId',
    as: 'safras',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'  
});

Safra.belongsTo(Gleba,  {
    foreignKey: 'glebaId',
    as: 'safra',
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

async function verificaTokens(req, res, next) {
    try{
        const token = req.headers.authorization.split(' ')[1];
        console.log(token)
        if(!token || token === undefined){
            return res.status(401).json({error:'Invalid token'});
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.AUDIENCE,  
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        const timestamp = payload.exp;
        const expiracaoData = new Date(timestamp*1000);
        const agora = new Date();

        if(expiracaoData < agora){
            return res.status(401).json({error:'Token expirado'});
        }

        req.user = payload;
        next();
    }catch(error){
        return res.status(500).json({error:'Internal Server Error'});

    }
}

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
});

/*------------------------
    ROTAS PROPRIEDADE
--------------------------*/

/* Rota para --> CADASTRO DE PROPRIEDADE */
app.post('/createPropriedade', async (req, res) => {
    try {
        const { name, city, area, email } = req.body;
        const user = await User.findOne({ where: { email: email } });


        if (!name || !city || !area || !email) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        const newProperty = await Property.create({
            name: name,
            city: city,
            area: area
        });

        const userProperty = await UserProperty.create({
            userId: user.id, 
            propertyId: newProperty.id, 
            access: "owner" 
        });

        return res.status(201).json({ 
            property: newProperty, 
            relationship: userProperty 
        });
    } catch (error) {
        console.error('Erro ao salvar propriedade:', error);
        return res.status(500).json({ error: 'Erro ao salvar a propriedade.' });
    }
});

/* Rota para --> BUSCA DE PROPRIEDADES */
app.get('/searchPropriedades/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const userProperty = await UserProperty.findAll({
            where: { userId: user.id },
            attributes: ['propertyId', 'access']
        });
        
        const propertyIds = userProperty.map(up => up.propertyId);
        const access = userProperty.map(up => up.access);
        
        const properties = await Property.findAll({
            where: {
                id: propertyIds
            }
        });
        
        const propertiesWithAccess = properties.map((property, index) => ({
            ...property.toJSON(),
            access: access[index]
        }));
        
        //console.log(propriedadesComAcesso);

        if (properties.length === 0) {
            return res.status(404).json({ message: 'Nenhuma propriedade cadastrada para este usuário.' });
        }

        return res.status(200).json(propertiesWithAccess);
    } catch (error) {
        console.error('Erro ao buscar propriedades do usuário:', error);
        return res.status(500).json({ error: 'Erro ao buscar propriedades do usuário' });
    }
});

/* Rota para --> EDIÇÃO DE PROPRIEDADE */
app.put('/editPropriedade/:id', async (req, res) => {
    try {
        const { name, area, city } = req.body;
        const [updated] = await Property.update(
            { name, area, city},
            { where: { id: req.params.id } }
        );


        if (updated) {
            const updatedProperty = await Property.findByPk(req.params.id);
            return res.json(updatedProperty);
        }

        res.status(404).json({ message: 'Propriedade não encontrada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* Rota para --> REMOVER PROPRIEDADE */

/* Rota para --> BUSCA POR DETERMINADA PROPRIEDADE E SEUS USUÁRIOS E SUAS GLEBAS */
app.get('/propriedades/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const property = await Property.findByPk(id);
        if (!property) {
            return res.status(404).json({ error: 'Propriedade não encontrada' });
        }

        const glebas =  await Gleba.findAll({
            where: {propertyId: id},
        })        

        //Procurando todos os usuários dessa propriedade
        const usersProperty = await UserProperty.findAll({
            where: { propertyId: id },
            attributes: ['userId', 'access']
        });

        const userIds = usersProperty.map(up => up.userId);

        //Procurando dados dos usuários
        const users = await User.findAll({
            where: {
                id: userIds
            },
            attributes: ['id', 'name', 'email'] 
        });

        //Juntando as informações dos usuários
        const usersData = usersProperty.map(up => {
            const user = users.find(u => u.id === up.userId);
            return {
                id: up.userId,
                access: up.access,
                name: user?.name,
                email: user?.email
            };
        });

        const owner = usersData.find(user => user.access === "owner");
        
        const result = {
            property: {
                id: property.id,
                name: property.name,
                city: property.city,
                area: property.area 
            },
            users: usersData, 
            owner: owner ? { name: owner.name, email: owner.email } : null,
            glebas: glebas

        };

        return res.status(200).json(result);
    } catch (error) {
        //console.error('Erro ao buscar propriedade:', error);
        return res.status(500).json({ error: 'Erro ao buscar propriedade' });
    }
});

/* Rota para --> OBTER UMA PROPRIEDADE PELO ID */
app.get('/propriedade/:id', async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Propriedade não encontrada' });
        }
        res.json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/*------------------------
        ROTAS GLEBAS
--------------------------*/

/* Rota para --> CADASTRO DE GLEBA*/
app.post('/createGleba', async (req, res) => {
    try {
        const { name, propertyId, area, email } = req.body;
        const user = await User.findOne({ where: { email: email } });


        if (!name || !propertyId || !area || !email) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        const newGleba = await Gleba.create({
            name: name,
            area: area,
            propertyId: propertyId
        });


        return res.status(201).json({ 
            gleba: newGleba
        });
    } catch (error) {
        console.error('Erro ao salvar gleba:', error);
        return res.status(500).json({ error: 'Erro ao salvar a gleba.' });
    }
});

/* Rota para --> BUSCA DE GLEBAS */
app.get('/searchGlebas/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ where: { email: email } });
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
            }
        });
        
        const propertiesWithAccess = properties.map((property, index) => ({
            ...property.toJSON(),
            access: access[index]
        }));
        
        //console.log(propriedadesComAcesso);

        if (properties.length === 0) {
            return res.status(404).json({ message: 'Nenhuma propriedade cadastrada para este usuário.' });
        }
        const result = propertiesWithAccess.map(property => {
            const glebas = property.glebas || [];
            return {
                ...property,
                glebas
            };
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Erro ao buscar glebas do usuário:', error);
        return res.status(500).json({ error: 'Erro ao buscar glebas do usuário' });
    }
});

/*  Rota para --> EDIÇÃO GLEBA */
app.put('/editGleba/:id', async (req, res) => {
    try {
        const { name, area } = req.body;
        const [updated] = await Gleba.update(
            { name, area},
            { where: { id: req.params.id } }
        );


        if (updated) {
            const updatedGleba = await Gleba.findByPk(req.params.id);
            return res.json(updatedGleba);
        }

        res.status(404).json({ message: 'Gleba não encontrada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* Rota para --> REMOVER DE GLEBA */

/*  Rota para --> BUSCA POR DETERMINADA GLEBA E SUAS SAFRAS */
app.get('/gleba/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const gleba = await Gleba.findByPk(id);
        if (!gleba) {
            return res.status(404).json({ error: 'Gleba não encontrada' });
        }

        //Recebendo dados da propriedade
        const property = await Property.findByPk(gleba.propertyId);

        //Procurar dono da propriedade
        const ownerProperty = await UserProperty.findOne({
            where: { propertyId: gleba.propertyId },
            attributes: ['userId', 'access']
        }); 
        
        const userId = ownerProperty?.userId

        const owner = await User.findByPk(userId);
        if (!owner) {
            return res.status(404).json({ error: 'Dono da gleba não encontrado' });
        }

        const safras = await Safra.findAll({
            where:{glebaId: gleba.id}
        })
        const safrasPlanned = safras.filter(safra => safra.type === 'Planejado');
        const safrasAchieved = safras.filter(safra => safra.type === 'Realizado');
        
        const result = {
            gleba: gleba,
            property: property,
            owner: owner,
            safrasPlanned: safrasPlanned,
            safrasAchieved: safrasAchieved
        };

        return res.status(200).json(result);
    } catch (error) {
        console.error('Erro ao buscar gleba:', error);
        return res.status(500).json({ error: 'Erro ao buscar gleba' });
    }
});

/*------------------------
        ROTAS SAFRAS
--------------------------*/
/* Rota para --> BUSCA DE SAFRAS */
app.get('/searchSafras/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ where: { email: email } });
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
                    model: Safra,
                    as: 'safras'  
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
                const safras = gleba.safras || []; 
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
        console.error('Erro ao buscar glebas do usuário:', error);
        return res.status(500).json({ error: 'Erro ao buscar glebas do usuário' });
    }
});

/*  Rota para --> BUSCA POR DETERMINADA SAFRA */
app.get('/safra/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const safra = await Safra.findByPk(id);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrada' });
        }

        //Recebendo dados da gleba
        const gleba = await Gleba.findByPk(safra.glebaId);

        //Recebendo dados da propriedade
        const property = await Property.findByPk(gleba.propertyId);

        //Procurar dono da propriedade
        const ownerProperty = await UserProperty.findOne({
            where: { propertyId: gleba.propertyId },
            attributes: ['userId', 'access']
        }); 
        
        const userId = ownerProperty?.userId

        const owner = await User.findByPk(userId);
        if (!owner) {
            return res.status(404).json({ error: 'Dono da gleba não encontrado' });
        }
        
        const result = {
            safra: safra,
            gleba: gleba,
            property: property,
            owner: owner
        };

        return res.status(200).json(result);
    } catch (error) {
        console.error('Erro ao buscar gleba:', error);
        return res.status(500).json({ error: 'Erro ao buscar gleba' });
    }
});



/*------------------------
        ENVIO DE EMAIL
--------------------------*/

/*

npm install nodemailer --> https://www.w3schools.com/nodejs/nodejs_email.asp

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_PASS 
  }
});

const mailOptions = {
  from: process.env.GMAIL_USER,
  to: 'yourfriend@email.com',
  subject: 'Sending Email using Node.js with Gmail',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});
*/


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