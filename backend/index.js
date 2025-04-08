const express = require("express");
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');

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
app.get('/properties/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Property.findOne({
            where: { id },
            include: [
                {
                    model: Gleba,
                    where: { propertyId: id },
                    as: "glebas",
                    required: false,
                },
                {
                    model: User,
                    through: {
                        model: UserProperty,
                        where: { propertyId: id },
                    },
                    required: false, 
                },
                {
                    model: StorageItem,
                    where: {propertyId: id},
                    as: "storage_items",
                    required: false, 
                }
            ],
        });
    
        if (!result) {
            return res.status(404).json({ error: 'Propriedade não encontrada' });
        }   
    
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar a propriedade' });
    }

});

/* Rota para --> BUSCAR PROPRIEDADES DISPONÍVEIS PARA CONVITES */
app.get('/properties-invites', async (req, res) => {
    const { email }  = req.query;
    try{
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const userProperties  = await UserProperty.findAll({
            where: { 
                userId: user.id,
                access: 'owner'
            },
            attributes: ['propertyId']
        });
        const propertyIds = userProperties.map(item => item.propertyId);

        const properties = await Property.findAll({
            where: {
                id: propertyIds,
            },
            attributes: ['id', 'name'],
        });
        
        const result = properties.map(property => ({
            id: property.id,
            name: property.name,
        }));

        return res.status(200).json(result);
    } catch (error) {
        console.error('Erro ao buscar custos do usuário:', error);
        return res.status(500).json({ error: 'Erro ao buscar custos do usuário' });
    }
});

/* Rota para --> BUSCAR PROPRIEDADES POR SAFRA */
app.get('/properties-by-safra', async (req, res) => {
    const { id }  = req.query;

    try {
        const safra = await Safra.findByPk(id);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrada' });
        }
        const result = await Safra.findOne({
            where: { id: id },
            include: [{
              model: Gleba,
              through: { model: SafraGleba },
              include: [{
                model: Property,
                as: 'property',
                required: true
              }]
            }]
        });
        console.log(result.glebas.length);

        if (result && result.glebas && result.glebas.length > 0) {
            // Extrai o id e name das propriedades associadas
            const properties = result.glebas.map(gleba => {
              const property = gleba.property;
              return {
                id: property.id,       // id da propriedade
                name: property.name    // nome da propriedade
              };
            });
          
            // Verifica se os ids são diferentes, removendo os duplicados
            const uniqueProperties = [];
            const seenIds = new Set();
          
            properties.forEach(property => {
              if (!seenIds.has(property.id)) {
                seenIds.add(property.id); // Adiciona o id ao Set para garantir unicidade
                uniqueProperties.push(property); // Adiciona a propriedade ao array de resultados
              }
            });
          
            // Retorna as propriedades com ids únicos
            return res.status(200).json(uniqueProperties);
        } else {
            return res.status(404).json({ message: 'Nenhuma gleba associada encontrada.' });
        }
    } catch (error) {
        console.error('Erro ao buscar propriedades:', error);
        return res.status(500).json({ error: 'Erro ao buscar propriedades' });
    }
});

/* Rota para --> CADASTRAR PROPRIEDADE */
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

/* Rota para --> REMOVER USUÁRIO DA PROPRIEDADE */
app.delete('/user-properties', async(req,res) =>{
    const { propertyId, userId }  = req.query;
    try{
        const propriedade = await Property.findByPk(propertyId);
        if (!propriedade) {
            return res.status(404).json({ error: 'Propriedade não encontrada.' });
        }

        await UserProperty.destroy({
            where: {
                propertyId: propertyId, 
                userId: userId,
            }
        });

        res.status(200).json({ message: 'Usuário removido da propriedade com sucesso.' });
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no servidor.' });
    }

});

/*------------------------
        ROTAS GLEBAS
--------------------------*/

/*  Rota para --> BUSCAR GLEBA */
app.get('/glebas/:id', async (req, res) => {
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

/*  Rota para --> BUSCAR GLEBAS DISPONÍVEIS PARA SAFRA */
app.get('/glebas-available', async (req, res) => {
    const { email }  = req.query;

    try {
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const userProperties = await UserProperty.findAll({
            where: { userId: user.id },
            attributes: ['propertyId', 'access']
        });
        
        const propertyIds = userProperties.map(up => up.propertyId);
        const access = userProperties.map(up => up.access);

        const properties  = await Property.findAll({
            where: {
                id: propertyIds
            },
            include: {
                model: Gleba, as: 'glebas', 
                attributes: ['id'],  
            }
        });

        const glebaIds = properties.flatMap(property =>
            property.glebas.map(gleba => gleba.id)
        );

        const glebasComStatus = await SafraGleba.findAll({
            where: { 
                glebaId: glebaIds
            }
        });
        
        const glebaIdsComStatusTrue = glebasComStatus
            .filter(gleba => gleba.statusSafra === true) 
            .map(gleba => gleba.glebaId); 
        
        const glebaIdsFiltrados = glebaIdsComStatusTrue.filter(glebaId => {
            return !glebasComStatus.some(gleba => gleba.glebaId === glebaId && gleba.statusSafra === false);
        });

        const glebasRegistradas = await SafraGleba.findAll({
            where: { glebaId: glebaIds }
        });

        const glebaIdsRegistradas = glebasRegistradas.map(gleba => gleba.glebaId);

        const glebaIdsNaoRegistradas = glebaIds.filter(glebaId => !glebaIdsRegistradas.includes(glebaId));

        const ids = [
            ...glebaIdsFiltrados,       
            ...glebaIdsNaoRegistradas      
        ];

        const result = await Gleba.findAll({
            where: {
                id: ids
            },
            include: {
                model: Property, as: 'property'
            }
        })
        return res.status(200).json(result);
    } catch (error) {
        console.error('Erro ao buscar gleba:', error);
        return res.status(500).json({ error: 'Erro ao buscar gleba' });
    }
});

/*  Rota para --> BUSCAR GLEBA PELA SAFRA*/
app.get('/glebas-by-safra', async (req, res) => {
    const { id }  = req.query;

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
                    as: 'property',  
                },
            }
            ],
        })

        return res.status(200).json(result.glebas);
    } catch (error) {
        console.error('Erro ao buscar safra:', error);
        return res.status(500).json({ error: 'Erro ao buscar safra' });
    }
});

/* Rota para --> CADASTRAR GLEBA*/
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

/*  Rota para --> EDITAR GLEBAS */
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

/* Rota para --> REMOVER GLEBA */
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

/*  Rota para --> BUSCAR SAFRA POR USER*/
app.get('/safras-by-user', async (req, res) => {
    const { email }  = req.query;

    try {
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const userProperties = await UserProperty.findAll({
            where: { userId: user.id },
            attributes: ['propertyId', 'access']
        });
        
        const propertyIds = userProperties.map(up => up.propertyId);
        const access = userProperties.map(up => up.access);
        
        const properties  = await Property.findAll({
            where: {
                id: propertyIds
            },
            include: {
                model: Gleba, as: 'glebas', 
                attributes: ['id'],  

            }
        });

        const glebaIds = properties.flatMap(property =>
            property.glebas.map(gleba => gleba.id)
        );

        const safras = await SafraGleba.findAll({
            where:{ glebaId: glebaIds }
        })

        const safraIds = [...new Set(safras.map(safra => safra.safraId))];
        const result = await Safra.findAll({
            where:{
                id: safraIds
            }
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error('Erro ao buscar safra:', error);
        return res.status(500).json({ error: 'Erro ao buscar safra' });
    }
});

/* Rota para --> CADASTRAR SAFRAS*/
app.post('/safras', async (req, res) => {
    try {
        const { email, 
            glebaIds, 
            safraName,
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
            precoVendaEstimado,
        } = req.body;
        console.log("TESTEEEE " + precoVendaEstimado);
        const user = await User.findOne({ where: { email: email } });

        const ids = glebaIds.map(id => Number(id));

        const totalArea = await Gleba.sum('area', {
            where: {
              id: ids
            }
        });

        if (
            !email || !glebaIds || !safraName || !cultivo || !semente || !metroLinear || !dosagem || !toneladas || 
            !adubo || !dataFimPlantio || !dataFimColheita || !tempoLavoura || !prodTotal || !prodPrevista || !precoVendaEstimado
        ) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
        console.log("PASSOUUU");

        const newSafra = await Safra.create({
            type: "Planejado",
            name: safraName,
            areaTotal: totalArea,
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
            precoVendaEstimado: precoVendaEstimado,
            precMilimetrica: 0,  
            umidade: 0,          
            impureza: 0,         
            graosAvariados: 0,   
            graosEsverdeados: 0, 
            graosQuebrados: 0,   
            prodRealizada: 0,  
            porcentHect: 0,
            precoVendaRealizado: 0,
        });

        if (glebaIds && glebaIds.length > 0) {
            for (let glebaId of glebaIds) {
                await SafraGleba.create({
                    safraId: newSafra.id,   
                    glebaId: glebaId, 
                    statusSafra: newSafra.status    
                });
            }
        }

        return res.status(201).json({ 
            safra: newSafra
        });
    } catch (error) {
        console.error('Erro ao salvar safra:', error);
        return res.status(500).json({ error: 'Erro ao salvar a safra.' });
    }
});

/*  Rota para --> EDITAR SAFRAS */
app.put('/safras', async (req, res) => {
    try {
        const { 
            id, 
            glebas,
            name,
            status, 
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

        let areaGleba = 0;
        //Adicionando primeiro a(s) gleba(s)
        if (glebas && glebas.length > 0) {
            for (let glebaId of glebas) {
                await SafraGleba.create({
                    safraId: id,   
                    glebaId: glebaId, 
                    statusSafra: status    
                });
            }
            const glebasIds = glebas.map(id => Number(id));

            areaGleba = await Gleba.sum('area', {
                where: {
                  id: glebasIds
                }
            });
        }

        if(status){
            //Caso for finalizar a safra atualizar status das glebas
            const [glebasUpdated] = await SafraGleba.update(
                { statusSafra: status},
                { where: { safraId: id } }
            )
        }

 

        const safra = await Safra.findByPk(id);
        const areaTotal = safra.areaTotal + areaGleba;

        const [updated] = await Safra.update(
            { 
                name,
                areaTotal,
                type,
                status,
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
                precMilimetrica,  
                umidade,          
                impureza,         
                graosAvariados,   
                graosEsverdeados, 
                graosQuebrados,   
                prodRealizada, 
            },
            { where: { id: id } }
        );

        if (updated) {
            const updatedSafra = await Safra.findByPk(id);
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
app.get('/custos', async (req, res) => {
    const { id }  = req.query;

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
                    model: User,  
                    through: { model: UserProperty },  
                    attributes: ['id', 'name', 'email'],  
                  }],
                  as: 'property',  
                },
                }],
                as: 'safra'
            }]
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Erro ao buscar custo:', error);
        return res.status(500).json({ error: 'Erro ao buscar custo' });
    }
});

/*  Rota para --> BUSCAR CUSTO POR USER*/
app.get('/custos-by-user', async (req, res) => {
    const { email }  = req.query;

    try {
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const userProperties = await UserProperty.findAll({
            where: { userId: user.id },
            attributes: ['propertyId', 'access']
        });
        
        const propertyIds = userProperties.map(up => up.propertyId);
        const access = userProperties.map(up => up.access);
        
        const properties  = await Property.findAll({
            where: {
                id: propertyIds
            },
            include: {
                model: Gleba, as: 'glebas', 
                attributes: ['id'],  

            }
        });

        const glebaIds = properties.flatMap(property =>
            property.glebas.map(gleba => gleba.id)
        );

        const safras = await SafraGleba.findAll({
            where:{ glebaId: glebaIds }
        });

        const safraIds = [...new Set(safras.map(safra => safra.safraId))];
        const result = await Custo.findAll({
            where:{
                safraId: safraIds
            }
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error('Erro ao buscar safra:', error);
        return res.status(500).json({ error: 'Erro ao buscar safra' });
    }
});

/* Rota para --> CADASTRAR CUSTOS */
app.post('/custos', async (req, res) => {
    try {
        const { email, 
            idSafra, 
            glebaId,
            name,
            category,
            unit,
            quantity,
            price,
            totalValue,
            date,
            note
        } = req.body;

        if (
            !email || !idSafra || !glebaId || !name || !category || !unit || !quantity || !price || !totalValue 
        ) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
        const safra = await Safra.findByPk(idSafra);

        const newCusto = await Custo.create({
            type: safra.type,
            status: safra.status,
            name: name,
            category: category,
            unit: unit,
            quantity: quantity,
            price: price,
            totalValue: totalValue,
            expirationDate: date ? date : null,
            note: note ? note : null,
            safraId: safraId,
            glebaId: glebaId       
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
app.put('/custos', async (req, res) => {
    try {
        const { 
            id,
            email, 
            safraId, 
            glebaId,
            name,
            category,
            unit,
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
                unit,
                quantity,
                price,
                totalValue,
                date,
                note,
                safraId, 
                glebaId
            },
            { where: { id: id } }
        );


        if (updated) {
            const updatedCusto = await Custo.findByPk(id);
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
        ROTAS ESTOQUE
--------------------------*/

/*  Rota para --> BUSCAR ESTOQUE DO USUÁRIO*/
app.get('/storage', async (req, res) => {
    const { email } = req.query;

    try {
        const user = await User.findOne({
            where: { email: email },
            include: {
                model: Property, 
                as: 'properties', 
                through: { attributes: [] } // Ignora os atributos da tabela de junção UserProperty
            }
        });
    
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
    
        const result = await StorageItem.findAll({
            where: {
                propertyId: user.properties.map(property => property.id) 
            },
            include: {
                model: Property, 
                as: 'property',  
                attributes: ['id', 'name']  
            }
        });
    
        return res.status(200).json(result);
    } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        return res.status(500).json({ error: 'Erro ao buscar estoque' });
    }
});

/*  Rota para --> BUSCAR ITEM ESTOQUE */
app.get('/storage/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await StorageItem.findOne({
            where: { id: id },
            include: [{
                model: Property,  
                    include: [{
                        model: User,  
                        through: { model: UserProperty },
                    }],
                    as: 'property',       
            }]
        });
        if (!result) {
            return res.status(404).json({ error: 'Item de Estoque não encontrado' });
        }


        return res.status(200).json(result);
    } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        return res.status(500).json({ error: 'Erro ao buscar estoque' });
    }
});

/*  Rota para --> CADASTRAR ITEM ESTOQUE */
app.post('/storage', async (req,res) => {
    try{
        const { email, 
            propertyId, 
            storedLocation,
            name,
            category,
            unit,
            quantity,
            price,
            totalValue,
            date,
            note
        } = req.body;
    
        if (
            !email || !propertyId || !name || !category || !unit || !quantity || !price || !totalValue
        ) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
    
        const result = await StorageItem.create({
            storedLocation: storedLocation? storedLocation : null,
            name: name,
            category: category,
            unit: unit,
            quantity: quantity,
            price: price,
            totalValue: totalValue,
            expirationDate: date ? date : null,
            note: note ? note : null,
            propertyId: propertyId       
        });
    
    
        return res.status(201).json({ 
            storageItem: result
        });
    }catch (error) {
        console.error('Erro ao salvar item no estoque:', error);
        return res.status(500).json({ error: 'Erro ao salvar o item no estoque.' });
    }
    
});

/*  Rota para --> EDITAR ITEM ESTOQUE */
app.put('/storage', async (req,res) => {
    try{
        const { 
            id,
            email, 
            propertyId, 
            storedLocation,
            name,
            category,
            unit,
            quantity,
            price,
            totalValue,
            date,
            note
        } = req.body;
    
        if (
            !email || !propertyId || !name || !category || !unit || !quantity || !price || !totalValue
        ) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        const [updated] = await StorageItem.update(
            { 
                name,
                category,
                unit,
                quantity,
                price,
                totalValue,
                date,
                note,
                propertyId,
                storedLocation,
            },
            { where: { id: id } }
        );
    
        if (updated) {
            const updatedStorageItem = await StorageItem.findByPk(id);
            return res.json(updatedStorageItem);
        }

        res.status(404).json({ message: 'Storage Item não encontrado' });
    }catch (error) {
        console.error('Erro ao editar item no estoque:', error);
        return res.status(500).json({ error: 'Erro ao editar o item no estoque.' });
    }
    
});

/*  Rota para --> DELETAR ITEM ESTOQUE */
app.delete('/storage', async(req,res) =>{
    const { id } = req.query;

    try {

        const storageItem = await StorageItem.findByPk(id);
        if (!storageItem) {
            return res.status(404).json({ error: 'Item de Estoque não encontrado.' });
        }

        await storageItem.destroy();
        res.status(200).json({ message: 'Item de Estoque deletado com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

/*  Rota para --> TRANSFERIR UM ITEM ESTOQUE */
app.post('/storage-custo', async (req,res) => {
    try{
        const { 
            idStorageItem, 
            idSafra, 
            idGleba,
            quantity,
        } = req.body;
    
        if (
            !quantity || !idStorageItem || !idSafra
        ) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        const storageItem = await StorageItem.findByPk(idStorageItem);
        storageItem.quantity = storageItem.quantity - quantity;
        storageItem.totalValue = storageItem.quantity * storageItem.price;

        const safra = await Safra.findByPk(idSafra);

        const newCusto = await Custo.create({
            type: safra.type,
            status: safra.status,
            name: storageItem.name,
            category: storageItem.category,
            unit: storageItem.unit,
            quantity: quantity,
            price: storageItem.price,
            totalValue: storageItem.price * quantity,
            expirationDate: storageItem.date ? storageItem.date : null,
            note: storageItem.note ? storageItem.note : null,
            safraId: idSafra,
            glebaId: idGleba,       
        });

        let updatedStorageItem = null;
        if(storageItem.quantity === 0){
            await StorageItem.destroy({ where: { id: idStorageItem } });
        }else{
            const [updated] = await StorageItem.update(
                { 
                    quantity: storageItem.quantity,
                    totalValue: storageItem.totalValue
                },
                { where: { id: idStorageItem} }
            );
            if (updated) {
                updatedStorageItem = await StorageItem.findByPk(idStorageItem);
            }
        }
    
        return res.status(201).json({ 
            storageItem: updatedStorageItem ? updatedStorageItem : null,
            custo: newCusto
        });
    }catch (error) {
        console.error('Erro ao salvar item no estoque:', error);
        return res.status(500).json({ error: 'Erro ao salvar o item no estoque.' });
    }
    
});

/*------------------------
        ROTAS DASHBOARD 
--------------------------*/

/*  Rota para --> GRÁFICO DE PIZZA DE CUSTOS */
app.get('/custos-pie-chart', async (req, res) => {
    const { safraId } = req.query;

    const safra = await Safra.findByPk(safraId);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrado' });
    }

    //Somando custos por categoria
    const query = `
      SELECT category, SUM(totalValue) AS value
      FROM Custos
      WHERE safraId = :safraId
      AND type = 'Planejado'
      GROUP BY category;
    `;
  
    try {
        const sumCustos = await connection.query(query, {
          replacements: { safraId },  
          type: QueryTypes.SELECT  
        });

        const categories = [
            'Defensivos',
            'Operações',
            'Semente',
            'Arrendamento',
            'Administrativo',
            'Corretivos e Fertilizantes'
            
        ];
          
        const result = categories.map(category => {
            const categoryFound = Array.isArray(sumCustos) ? sumCustos.find(result => result.category === category) : null;
            return {
              id: category,  // Adiciona o atributo 'id' com o mesmo valor de 'category'
              label: category,
              value: categoryFound ? categoryFound.value : 0 
            };
        });
        return res.json(result);
      } catch (error) {
        console.error('Erro ao executar a consulta:', error);
        res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
      }
});

/*  Rota para --> GRÁFICO DE PIZZA DE TODOS CUSTOS DE SAFRAS */
app.get('/all-custos-pie-chart', async (req, res) => {
    const { email} = req.query;

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
                where: {
                    type: 'Realizado',  
                    status: false         
                }
            }
        }
    });

    const safraIds = new Set();  

    properties.forEach(property => {
        property.glebas.forEach(gleba => {
            gleba.safras.forEach(safra => {
                safraIds.add(safra.id);  
            });
        });
    });

    const uniqueSafraIds = [...safraIds];
    const query = `
        SELECT category, SUM(totalValue) AS value
        FROM Custos
        WHERE safraId = :safraId
        AND type = 'Realizado' AND status = false
        GROUP BY category;
    `;
    let sumCustos = 0;
    for (let safraId of uniqueSafraIds) {
        try {
            sumCustos  = await connection.query(query, {
            replacements: { safraId },  
            type: QueryTypes.SELECT
          });
    
          // Exibe os resultados da consulta para o safraId atual
          console.log(`Custos para safraId ${safraId}:`, sumCustos);

          const categories = [
            'Defensivos',
            'Operações',
            'Semente',
            'Arrendamento',
            'Administrativo',
            'Corretivos e Fertilizantes'
            
        ];
          
        const result = categories.map(category => {
            const categoryFound = Array.isArray(sumCustos) ? sumCustos.find(result => result.category === category) : null;
            return {
              id: category,  // Adiciona o atributo 'id' com o mesmo valor de 'category'
              label: category,
              value: categoryFound ? categoryFound.value : 0 
            };
        });
        return res.json(result);

        } catch (error) {
          console.error(`Erro ao buscar custos para safraId ${safraId}:`, error);
        }
    }
});

/*  Rota para --> GRÁFICO DE LINHA DE CUSTOS POR GLEBA */
app.get('/custos-glebas-line-chart', async (req, res) => {
    const { safraId } = req.query;

    const safra = await Safra.findByPk(safraId);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrado' });
    }

    //Somando custos por categoria
    const query = `
        SELECT 
            sg.glebaId, 
            c.category, 
            IFNULL(SUM(custos.totalValue), 0) AS value
        FROM 
            (SELECT DISTINCT glebaId FROM safra_glebas WHERE safraId = :safraId) AS sg
        CROSS JOIN 
            (SELECT DISTINCT category FROM Custos) AS c
        LEFT JOIN 
            Custos AS custos
        ON 
            custos.glebaId = sg.glebaId 
            AND custos.category = c.category 
            AND custos.safraId = :safraId
        GROUP BY 
            sg.glebaId, c.category;
    `;
  
    try {
        const sumCustos = await connection.query(query, {
          replacements: { safraId },  
          type: QueryTypes.SELECT  
        });

        const categories = [
            'Defensivos',
            'Operações',
            'Semente',
            'Arrendamento',
            'Administrativo',
            'Corretivos e Fertilizantes'
        ];
         
        const result = categories.map(category => {
            // Encontrar todas as glebas que têm custos para a categoria específica
            const categoryFound = sumCustos.filter(item => item.category === category);
            
            // Criar o objeto para cada categoria, contendo o nome da categoria e os valores somados por gleba
            const data = categoryFound.map(item => ({
                x: `Gleba ${item.glebaId}`, // Nome da gleba
                y: item.value // Valor somado da gleba
            }));
    
            return {
                id: category,
                data: data // Dados formatados por gleba
            };
        });

        return res.json(result);
      } catch (error) {
        console.error('Erro ao executar a consulta:', error);
        res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
      }
});

/*  Rota para --> GRÁFICO DE BARRA DE CUSTOS POR CATEGORIA POR GLEBA */
app.get('/custos-glebas-bar-chart', async (req, res) => {
    const { safraId } = req.query;

    const safra = await Safra.findByPk(safraId);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrado' });
    }
    console.log("safra type = " + safra.type);

    //Somando custos por categoria
    const query = `
        SELECT 
            sg.glebaId, 
            c.category, 
            IFNULL(SUM(custos.totalValue), 0) AS value
        FROM 
            (SELECT DISTINCT glebaId FROM safra_glebas WHERE safraId = :safraId) AS sg
        CROSS JOIN 
            (SELECT DISTINCT category FROM Custos) AS c
        LEFT JOIN 
            Custos AS custos
        ON 
            custos.glebaId = sg.glebaId 
            AND custos.category = c.category 
            AND custos.safraId = :safraId
            AND custos.type = :type
        GROUP BY 
            sg.glebaId, c.category;
    `;
  
    try {
        const sumCustos = await connection.query(query, {
            replacements: { safraId, type: safra.type },  
            type: QueryTypes.SELECT  
        });

        sumCustos.forEach(item => {
            if (item.category === 'Corretivos e Fertilizantes') {
                item.category = 'Corr. e Fert.';
            }
        });

        const categories = [
            'Defensivos',
            'Operações',
            'Semente',
            'Arrendamento',
            'Administrativo',
            'Corr. e Fert.'
        ];
         
        const glebas = [...new Set(sumCustos.map(item => item.glebaId))];

        // Criar o resultado no formato desejado
        const result = glebas.map(glebaId => {
            // Iniciar o objeto para a gleba
            const glebaData = {
                gleba: `Gleba ${glebaId}` // Nome da gleba
            };
    
            // Para cada categoria, buscar o valor correspondente
            categories.forEach(category => {
                const categoryFound = sumCustos.find(item => item.glebaId === glebaId && item.category === category);
                glebaData[category.toLowerCase()] = categoryFound ? categoryFound.value : 0; // Adicionar o valor ou 0 se não encontrado
            });
    
            return glebaData; // Retorna o objeto da gleba com todas as categorias
        });

        return res.json(result);
      } catch (error) {
        console.error('Erro ao executar a consulta:', error);
        res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
      }
});

/* Rota para --> GRÁFICO DE BARRA DE CUSTO MÉDIO POR HECTARE POR GLEBA */
app.get('/custos-hectares-glebas-bar-chart', async (req, res) => {
    const { safraId } = req.query;

    const safra = await Safra.findByPk(safraId);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrado' });
    }

    //Somando custos por categoria
    const query = `
        SELECT 
            sg.glebaId,  
            IFNULL(SUM(custos.totalValue), 0) AS value
        FROM 
            (SELECT DISTINCT glebaId FROM safra_glebas WHERE safraId = :safraId) AS sg
        LEFT JOIN 
            Custos AS custos
        ON 
            custos.glebaId = sg.glebaId 
            AND custos.safraId = :safraId
            AND custos.type = :type
        GROUP BY 
            sg.glebaId;
    `;
  
    try {
        const sumCustos = await connection.query(query, {
            replacements: { safraId, type: safra.type },  
            type: QueryTypes.SELECT  
        });
         
        const glebas = [...new Set(sumCustos.map(item => item.glebaId))];

        const result = glebas.map(glebaId => {
            const glebaData = {
                gleba: `Gleba ${glebaId}` 
            };

            sumCustos.forEach(item => {
                if (item.glebaId === glebaId) {
                    glebaData["custo"] = item.value; 
                }
            });
    
            return glebaData; 
        });

        return res.json(result);
      } catch (error) {
        console.error('Erro ao executar a consulta:', error);
        res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
      }
});

/* Rota para --> GRÁFICO DE BARRA DE CUSTO MÉDIO POR HECTARE POR GLEBA */
app.get('/custos-categoria-bar-chart', async (req, res) => {
    const { safraId } = req.query;

    const safra = await Safra.findByPk(safraId);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrado' });
    }

    //Somando custos por categoria
    const query = `
       SELECT category, SUM(totalValue) AS value
        FROM Custos
        WHERE safraId = 2
        AND type = 'Realizado'
        GROUP BY category;
    `;
  
    try {
        const sumCustos = await connection.query(query, {
          replacements: { safraId },  
          type: QueryTypes.SELECT  
        });

        sumCustos.forEach(item => {
            if (item.category === 'Corretivos e Fertilizantes') {
                item.category = 'Corr. e Fert.';
            }
        });

        return res.json(sumCustos);
      } catch (error) {
        console.error('Erro ao executar a consulta:', error);
        res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
      }
});

app.get('/report-safra', async (req, res) => {
    const { id } = req.query;

    const safra = await Safra.findByPk(id);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrado' });
    }

    //Somando custos por categoria
    const query = `
        SELECT SUM(totalValue) AS totalCustos
        FROM custos
        WHERE safraId = :id;
    `;
  
    try {
        const [sumCustos] = await connection.query(query, {
          replacements: { id },  
          type: QueryTypes.SELECT  
        });

        const custoMedio = (sumCustos.totalCustos / safra.areaTotal);
        const receitaBruta = safra.precoVendaEstimado * safra.areaTotal * safra.prodPrevista;
        const lucroTotal = receitaBruta - sumCustos.totalCustos;
        const lucroHect = lucroTotal / safra.areaTotal;
        /* PONTO EQUILÍBRIO = CUSTO MÉDIO / PREÇO VENDA */
        const pontoEquilibrio = custoMedio / safra.precoVendaEstimado;
        /* LAIR --> LUCRO ANTES DO IMPOSTO DE RENDA */
        const receitaHect = safra.precoVendaEstimado * safra.prodPrevista;
        const rentabilidadeLair = (receitaHect / custoMedio) - 1;
        const funrural = receitaBruta*0.2;
        /* IMPOSTO DE RENDA --> (LUCRO TOTAL - FUNRURAL) * 20% */
        const importoRenda =  (lucroTotal - funrural) * 0.2;
        const lucroLiquido = lucroTotal - funrural - importoRenda;
        const lucroLiquidoHect = lucroLiquido / safra.areaTotal;
        const rentabilidadeTotal = lucroLiquidoHect / custoMedio;

        const result = {
            areaTotal: formatarNumero(safra.areaTotal),
            precoVenda: formatarNumero(safra.precoVendaEstimado),
            custoTotal: formatarNumero(sumCustos.totalCustos) || 0,
            custoMedio:  formatarNumero(custoMedio),
            prodEstimada: formatarNumero(safra.prodPrevista), 
            pontoEquilibrio: formatarNumero(pontoEquilibrio),
            receitaBruta: formatarNumero(receitaBruta),
            lucroTotal: formatarNumero(lucroTotal),
            lucroHect: formatarNumero(lucroHect),
            rentabilidadeLair: formatarNumero(rentabilidadeLair),
            rentabilidadeFinal: formatarNumero(rentabilidadeTotal),

        };
      
        return res.json(result);
        

    } catch (error) {
        console.error('Erro ao executar a consulta:', error);
        res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
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

function formatarNumero(valor) {
    const numeroFormatado = new Intl.NumberFormat('pt-BR', { 
        style: 'decimal', 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
    }).format(valor);
    
    // Verificar se as casas decimais são "00" e removê-las se for o caso
    if (valor % 1 === 0) {
        return numeroFormatado; 
    } else {
        return numeroFormatado.replace(/(\,00)$/, ''); // Remove a vírgula com "00" no final
    }
}