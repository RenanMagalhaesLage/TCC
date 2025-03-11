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
const Custo = require("./database/Custo");
const SafraGleba = require("./database/SafraGleba");
const Storage = require("./database/Storage");

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

User.hasMany(Storage, {
    foreignKey: 'userId',  
    as: 'storages',           
    onDelete: 'CASCADE',      
    onUpdate: 'CASCADE'       
});

Storage.belongsTo(User, {
    foreignKey: 'userId',  
    as: 'user',            
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


/* Rota para --> BUSCA TODOS OS DADOS DO USER - DADO DETERMINADO EMAIL 
   Retorno: Propriedades, Glebas, Safras e Custos associados ao user */
app.get('/user', async (req, res) => {
    const { email }  = req.query;

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

/*------------------------
    ROTAS PROPRIEDADE
--------------------------*/

/* Rota para --> BUSCAR PROPRIEDADE 
   Retorno: Propriedade, Glebas e Users associados à Propriedade */
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

/* Rota para --> CADASTRAR DE PROPRIEDADE */
app.post('/propriedades', async (req, res) => {
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

/* Rota para --> EDITAR PROPRIEDADE */
app.put('/propriedades/:id', async (req, res) => {
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
app.delete('/propriedades/:id', async(req,res) =>{
    try {
        const { id } = req.params;
        const propriedade = await Property.findByPk(id);
        if (!propriedade) {
            return res.status(404).json({ error: 'Propriedade não encontrada.' });
        }
        const glebas = await Gleba.findAll({
            where: { propertyId: id }
        });
        const glebasIds = glebas.map(gleba => gleba.id);

        const safras = await Safra.findAll({
            where: { glebaId: glebasIds }
        });
        const safraIds = safras.map(safra => safra.id);

        await Custo.destroy({
            where: { safraId: safraIds }
        });

        await Safra.destroy({
            where: { glebaId: glebasIds }
        });

        await Gleba.destroy({
            where: { propertyId: id }
        });

        await propriedade.destroy();

        res.status(200).json({ message: 'Propriedade deletada com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

/*------------------------
        ROTAS GLEBAS
--------------------------*/

/*  Rota para --> BUSCAR GLEBA 
    Retorno: Gleba e Safras associados à Gleba */
app.get('/gleba/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const gleba = await Gleba.findByPk(id);
        if (!gleba) {
            return res.status(404).json({ error: 'Gleba não encontrada' });
        }

        const result = await Gleba.findOne({
            where: { id: id},
            include: [{
                model: Safra,
                through: { model: SafraGleba },  
            },
            {
                model: Property,  
                include: [{
                    model: User,  
                    through: { model: UserProperty },
                    here: { '$user_properties.access$': 'owner' }
                }],
                as: 'property',  
            },
            ],
        })

        return res.status(200).json(result);
    } catch (error) {
        console.error('Erro ao buscar gleba:', error);
        return res.status(500).json({ error: 'Erro ao buscar gleba' });
    }
});

/* Rota para --> CADASTRAR DE GLEBA*/
app.post('/glebas', async (req, res) => {
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

/*  Rota para --> EDITAR DE GLEBAS */
app.put('/glebas/:id', async (req, res) => {
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
app.delete('/glebas/:id', async(req,res) =>{
    try {
        const { id } = req.params;
        const gleba = await Gleba.findByPk(id);
        if (!gleba) {
            return res.status(404).json({ error: 'Gleba não encontrada.' });
        }
        const safras = await Safra.findAll({
            where: { glebaId: id }
        });

        const safraIds = safras.map(safra => safra.id);
        await Custo.destroy({
            where: { safraId: safraIds }
        });

        await Safra.destroy({
            where: { glebaId: id }
        });

        await gleba.destroy();
        res.status(200).json({ message: 'Gleba deletada com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});


/*------------------------
        ROTAS SAFRAS
--------------------------*/

/*  Rota para --> BUSCAR SAFRA POR ID*/
app.get('/safras/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const safra = await Safra.findByPk(id);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrada' });
        }
        const result = await Safra.findOne({
            where: { id: id},
            include: [{
                model: Gleba,
                through: { model: SafraGleba },  
                include: {
                    model: Property,  
                    include: [{
                        model: User,  
                        through: { model: UserProperty },
                        here: { '$user_properties.access$': 'owner' }
                    }],
                    as: 'property',  
                },
            },
            {
                model: Custo, 
                where: { safraId: id },
                required: false, 
                as: "custos"
            }
            ],
        })

        return res.status(200).json(result);
    } catch (error) {
        console.error('Erro ao buscar safra:', error);
        return res.status(500).json({ error: 'Erro ao buscar safra' });
    }
});

/* Rota para --> CADASTRAR SAFRAS*/
app.post('/safras', async (req, res) => {
    try {
        const { email, glebaId, 
            cultivo, 
            semente,
            metroLinear,
            dosagem,
            toneladas,
            adubo,
            dataFimPlantio,
            dataFimColheita,
            tempoLavoura,
            prodTotal,
            prodPrevista, 
        } = req.body;
        const user = await User.findOne({ where: { email: email } });


        if (
            !email || !glebaId || !cultivo || !semente || !metroLinear || !dosagem || !toneladas || 
            !adubo || !dataFimPlantio || !dataFimColheita || !tempoLavoura || !prodTotal || !prodPrevista
        ) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        const newSafra = await Safra.create({
            type: "Planejado",
            status: false,
            cultivo: cultivo,
            semente: semente,
            metroLinear: metroLinear,
            dosagem: dosagem,
            toneladas: toneladas,
            adubo: adubo,
            dataFimPlantio: dataFimPlantio,
            dataFimColheita: dataFimColheita,
            tempoLavoura: tempoLavoura,
            prodTotal: prodTotal,
            prodPrevista: prodPrevista, 
            precMilimetrica: 0,  
            umidade: 0,          
            impureza: 0,         
            graosAvariados: 0,   
            graosEsverdeados: 0, 
            graosQuebrados: 0,   
            prodRealizada: 0,  
            porcentHect: 0,
            glebaId: glebaId       
        });


        return res.status(201).json({ 
            safra: newSafra
        });
    } catch (error) {
        console.error('Erro ao salvar safra:', error);
        return res.status(500).json({ error: 'Erro ao salvar a safra.' });
    }
});

/*  Rota para --> EDITAR SAFRAS */
app.put('/safras/:id', async (req, res) => {
    try {
        const { 
            email, 
            glebaId, 
            cultivo, 
            semente,
            metroLinear,
            dosagem,
            toneladas,
            adubo,
            dataFimPlantio,
            dataFimColheita,
            tempoLavoura,
            prodTotal,
            prodPrevista, 
            type,
            precMilimetrica,  
            umidade,          
            impureza,         
            graosAvariados,   
            graosEsverdeados, 
            graosQuebrados,   
            prodRealizada,  
            //porcentHect,
        } = req.body;
        const [updated] = await Safra.update(
            { 
                cultivo, 
                semente,
                metroLinear,
                dosagem,
                toneladas,
                adubo,
                dataFimPlantio,
                dataFimColheita,
                tempoLavoura,
                prodTotal,
                prodPrevista,
                type,
                precMilimetrica,  
                umidade,          
                impureza,         
                graosAvariados,   
                graosEsverdeados, 
                graosQuebrados,   
                prodRealizada, 
            },
            { where: { id: req.params.id } }
        );


        if (updated) {
            const updatedSafra = await Safra.findByPk(req.params.id);
            return res.json(updatedSafra);
        }

        res.status(404).json({ message: 'Safra não encontrada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* Rota para --> REMOVER SAFRAS */
app.delete('/safras/:id', async(req,res) =>{
    try {
        const { id } = req.params; 
        const safra = await Safra.findByPk(id);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrada.' });
        }

        await Custo.destroy({
            where: { safraId: id },
        });        

        await safra.destroy();
        res.status(200).json({ message: 'Safra deletada com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

/*------------------------
        ROTAS CUSTOS
--------------------------*/

/* Rota para --> BUSCAR CUSTO POR ID*/
app.get('/custos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const custo = await Custo.findByPk(id);
        if (!custo) {
            return res.status(404).json({ error: 'Custo não encontrado' });
        }

        const result = await Custo.findOne({
            where: { id: id},
            include:[{
                model: Safra,
                include: [{
                    model: Gleba,
                through: { model: SafraGleba },  
                include: {
                  model: Property,  
                  include: [{
                    model: User,  // Incluir os usuários relacionados à Property
                    through: { model: UserProperty },  // Tabela intermediária UserProperty
                    attributes: ['id', 'name'],  // Coloque os atributos que você deseja do User
                  }],
                  as: 'property',  
                },
                }],
                as: 'safra'
            }]
        })
        
        return res.status(200).json(result);
        /*  

        const property = await Property.findByPk(gleba.propertyId);

        const ownerProperty = await UserProperty.findOne({
            where: { propertyId: gleba.propertyId },
            attributes: ['userId', 'access']
        }); 
        
        const userId = ownerProperty?.userId

        const owner = await User.findByPk(userId);
        if (!owner) {
            return res.status(404).json({ error: 'Dono do custo não encontrado' });
        }
        
        const result = {
            custo: custo,
            safra: safra,
            gleba: gleba,
            property: property,
            owner: owner
        };

        return res.status(200).json(result);*/
    } catch (error) {
        console.error('Erro ao buscar custo:', error);
        return res.status(500).json({ error: 'Erro ao buscar custo' });
    }
});

/* Rota para --> CADASTRAR CUSTOS */
app.post('/custos', async (req, res) => {
    try {
        const { email, safraId, 
            name,
            category,
            unit,
            quantity,
            price,
            totalValue,
            date,
            note
        } = req.body;
        const user = await User.findOne({ where: { email: email } });


        if (
            !email || !safraId || !name || !category || !unit || !quantity || !price || !totalValue || !date || !note
        ) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
        const safra = await Safra.findByPk(safraId)

        const newCusto = await Custo.create({
            type: safra.type,
            status: safra.status,
            name: name,
            category: category,
            unit: unit,
            quantity: quantity,
            price: price,
            totalValue: totalValue,
            date: date,
            note: note,
            safraId: safraId       
        });


        return res.status(201).json({ 
            custo: newCusto
        });
    } catch (error) {
        console.error('Erro ao salvar custo:', error);
        return res.status(500).json({ error: 'Erro ao salvar o custo.' });
    }
});

/* Rota para --> EDITAR CUSTOS */
app.put('/custos/:id', async (req, res) => {
    try {
        const { 
            email, 
            safraId, 
            name,
            category,
            unity,
            quantity,
            price,
            totalValue,
            date,
            note
        } = req.body;

        const [updated] = await Custo.update(
            { 
                name,
                category,
                unity,
                quantity,
                price,
                totalValue,
                date,
                note
            },
            { where: { id: req.params.id } }
        );


        if (updated) {
            const updatedCusto = await Custo.findByPk(req.params.id);
            return res.json(updatedCusto);
        }

        res.status(404).json({ message: 'Custo não encontrado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* Rota para --> REMOVER CUSTOS */
app.delete('/custos/:id', async(req,res) =>{
    try {
        const { id } = req.params; 

        const custo = await Custo.findByPk(id);
        if (!custo) {
            return res.status(404).json({ error: 'Custo não encontrado.' });
        }

        await custo.destroy();
        res.status(200).json({ message: 'Custo deletado com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});


/*------------------------
        ROTAS INVITE
--------------------------*/

/* Rota para --> BUSCA DE INVITES */
app.get('/searchInvites/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
    
        const invites = await Invite.findAll({
            where: { reciverId: user.id },
        });

        if (!invites) {
            return res.status(404).json({ error: 'Nenhum convite encontrado' });
        }

        const invitesWithDetails = await Promise.all(
            invites.map(async (invite) => {
    
                const property = await Property.findOne({
                    where: { id: invite.propertyId }
                });
    
                const sender = await User.findByPk(invite.senderId);
    
                return {
                    invite,
                    property,
                    sender
                };
            })
        );
    
        return res.status(200).json(invitesWithDetails);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar convites do usuário' });
    }
});

/* Rota para --> CADASTRO DE INVITES */
app.post('/createInvite', async (req, res) => {
    try {
        const { reciverEmail, propertyId, senderEmail } = req.body;
        const sender = await User.findOne({ where: { email: senderEmail } });
        const reciver = await User.findOne({ where: { email: reciverEmail } });

        if (!reciver) {
            return res.status(400).json({ error: 'Destinatário não encontrado.' });
        }

        const verifyInvite = await Invite.findOne({
            where: {
                propertyId: propertyId,  
                reciverId: reciver.id     
            }
        })

        if(verifyInvite){
            return res.status(200).json('Destinatário já possui esse convite.');
        }

        const newInvite = await Invite.create({
            senderId: sender.id,
            reciverId: reciver.id,
            propertyId: propertyId
        });

        return res.status(201).json({ 
            invite: newInvite
        });
    } catch (error) {
        console.error('Erro ao salvar invite:', error);
        return res.status(500).json({ error: 'Erro ao salvar o invite.' });
    }
});

/* Rota para --> ACEITAR OU RECUSAR INVITE */
app.post('/acceptInvite/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { answer } = req.body;

        if (answer) {
            const invite = await Invite.findByPk(id);
            if (!invite) {
                return res.status(404).json({ error: 'Convite não encontrado' });
            }

            await UserProperty.create({
                access: "guest",
                userId: invite.reciverId,
                propertyId: invite.propertyId,
            });

            await Invite.destroy({
                where: { id: id }
            });

            return res.status(200).json({ message: 'Convite aceito e propriedade adicionada.' });

        } else {
            const deletedInvite = await Invite.destroy({
                where: { id: id }
            });

            if (deletedInvite === 0) {
                return res.status(404).json({ error: 'Convite não encontrado para remoção.' });
            }

            return res.status(200).json({ message: 'Convite recusado e removido.' });
        }

    } catch (error) {
        console.error('Erro ao salvar invite:', error);
        return res.status(500).json({ error: 'Erro ao salvar o invite.' });
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