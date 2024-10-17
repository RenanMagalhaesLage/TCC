const express = require("express");

//Configurando autenticação Google
const {OAuth2Client} = require('google-auth-library');
require('dotenv').config();
const client = new OAuth2Client();

const app = express();
const connection = require("./database/database");
const bodyParser = require("body-parser");
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:5173', // ou a porta onde seu front-end está rodando
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));


//Models
const Usuario = require("./database/Usuario");
const Propriedade = require("./database/Propriedade");
const UsuarioPropriedade = require("./database/UsuarioPropriedade");
const Gleba = require("./database/Gleba");
const PropriedadeGleba = require("./database/PropriedadeGleba"); // Ajuste o caminho conforme necessário

Usuario.belongsToMany(Propriedade, { through: UsuarioPropriedade });
Propriedade.belongsToMany(Usuario, { through: UsuarioPropriedade });

Propriedade.belongsToMany(Gleba, { through: PropriedadeGleba });
Gleba.belongsToMany(Propriedade, { through: PropriedadeGleba });

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
        const existingUser = await Usuario.findOne({ where: { email: userEmail } });

        if (!existingUser) {
           const newUser = await Usuario.create({
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
app.post('/propriedade', async (req, res) => {
    try {
        const { name, city, area, email } = req.body;
        const user = await Usuario.findOne({ where: { email: email } });


        if (!name || !city || !area || !email) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        const novaPropriedade = await Propriedade.create({
            name: name,
            city: city,
            area: area
        });

        const usuarioPropriedade = await UsuarioPropriedade.create({
            usuarioId: user.id, 
            propriedadeId: novaPropriedade.id, 
            access: "owner" 
        });

        return res.status(201).json({ 
            propriedade: novaPropriedade, 
            relacionamento: usuarioPropriedade 
        });
    } catch (error) {
        console.error('Erro ao salvar propriedade:', error);
        return res.status(500).json({ error: 'Erro ao salvar a propriedade.' });
    }
});

/* Rota para --> BUSCA DE PROPRIEDADES */
app.get('/:email/propriedades', async (req, res) => {
    const { email } = req.params;

    try {
        //const usuario = await Usuario.findByPk(userId);
        const user = await Usuario.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const usuarioPropriedades = await UsuarioPropriedade.findAll({
            where: { usuarioId: user.id },
            attributes: ['propriedadeId', 'access']
        });
        
        const propriedadeIds = usuarioPropriedades.map(up => up.propriedadeId);
        const acessos = usuarioPropriedades.map(up => up.access);
        
        const propriedades = await Propriedade.findAll({
            where: {
                id: propriedadeIds
            }
        });
        
        const propriedadesComAcesso = propriedades.map((propriedade, index) => ({
            ...propriedade.toJSON(),
            access: acessos[index]
        }));
        
        //console.log(propriedadesComAcesso);

        if (propriedades.length === 0) {
            return res.status(404).json({ message: 'Nenhuma propriedade cadastrada para este usuário.' });
        }

        return res.status(200).json(propriedadesComAcesso);
    } catch (error) {
        console.error('Erro ao buscar propriedades do usuário:', error);
        return res.status(500).json({ error: 'Erro ao buscar propriedades do usuário' });
    }
});

// BUSCA POR DETERMINADA PROPRIEDADE E SEUS USUÁRIOS --> futuramente suas glebas 
app.get('/propriedades/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const propriedade = await Propriedade.findByPk(id);
        if (!propriedade) {
            return res.status(404).json({ error: 'Propriedade não encontrada' });
        }

        const propriedadeGleba = await PropriedadeGleba.findAll({
            where: {propriedadeId: id},
            attributes: ['glebaId']
        })

        let glebas = [];
        if (propriedadeGleba && propriedadeGleba.length > 0) {
            // Extraindo os IDs de cada gleba (caso haja mais de uma)
            const glebasId = propriedadeGleba.map(pg => pg.glebaId);
        
            // Buscando todas as glebas com base nos IDs retornados
            glebas = await Gleba.findAll({
                where: { id: glebasId }
            });
        
        } else {
            console.log('Nenhuma gleba encontrada para a propriedade.');
        }

        //Procurando todos os usuários dessa propriedade
        const usuariosPropriedade = await UsuarioPropriedade.findAll({
            where: { propriedadeId: id },
            attributes: ['usuarioId', 'access']
        });

        const usuarioIds = usuariosPropriedade.map(up => up.usuarioId);

        //Procurando dados dos usuários
        const usuariosDados = await Usuario.findAll({
            where: {
                id: usuarioIds
            },
            attributes: ['id', 'name', 'email'] 
        });

        //Juntando as informações dos usuários
        const usuariosCompletos = usuariosPropriedade.map(up => {
            const usuarioDados = usuariosDados.find(u => u.id === up.usuarioId);
            return {
                id: up.usuarioId,
                access: up.access,
                name: usuarioDados?.name,
                email: usuarioDados?.email
            };
        });

        const owner = usuariosCompletos.find(usuario => usuario.access === "owner");
        
        const resposta = {
            propriedade: {
                id: propriedade.id,
                name: propriedade.name,
                city: propriedade.city,
                area: propriedade.area 
            },
            usuarios: usuariosCompletos, 
            owner: owner ? { name: owner.name, email: owner.email } : null,
            glebas: glebas

        };

        return res.status(200).json(resposta);
    } catch (error) {
        //console.error('Erro ao buscar propriedade:', error);
        return res.status(500).json({ error: 'Erro ao buscar propriedade' });
    }
});

/* Rota para --> EDIÇÃO/UPDATE DE PROPRIEDADE */
app.put('/propriedades/edit/:id', async (req, res) => {
    try {
        const { name, area, city } = req.body;
        const [updated] = await Propriedade.update(
            { name, area, city},
            { where: { id: req.params.id } }
        );


        if (updated) {
            const updatedProperty = await Propriedade.findByPk(req.params.id);
            return res.json(updatedProperty);
        }

        res.status(404).json({ message: 'Propriedade não encontrada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* Rota para --> OBTER UMA PROPRIEDADE PELO ID */
app.get('/propriedade/:id', async (req, res) => {
    try {
        const propriedade = await Propriedade.findByPk(req.params.id);
        if (!propriedade) {
            return res.status(404).json({ message: 'Propriedade não encontrada' });
        }
        res.json(propriedade);
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
        const { name, propertieId, area, email } = req.body;
        const user = await Usuario.findOne({ where: { email: email } });


        if (!name || !propertieId || !area || !email) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        const novaGleba = await Gleba.create({
            name: name,
            area: area
        });

        const propriedadeGleba = await PropriedadeGleba.create({
            propriedadeId: propertieId, 
            glebaId: novaGleba.id, 
        });

        return res.status(201).json({ 
            gleba: novaGleba, 
            relacionamento: propriedadeGleba
        });
    } catch (error) {
        console.error('Erro ao salvar gleba:', error);
        return res.status(500).json({ error: 'Erro ao salvar a gleba.' });
    }
});

/* Rota para --> BUSCA DE GLEBAS */
app.get('/:email/searchGlebas', async (req, res) => {
    const { email } = req.params;

    try {
        //const usuario = await Usuario.findByPk(userId);
        const user = await Usuario.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        /* Busca todas as propriedades associadas ao usuário e seus níveis de acesso*/
        const usuarioPropriedades = await UsuarioPropriedade.findAll({
            where: { usuarioId: user.id },
            attributes: ['propriedadeId', 'access']
        });
        
        const propriedadeIds = usuarioPropriedades.map(up => up.propriedadeId);
        const acessos = usuarioPropriedades.map(up => up.access);
        
        const propriedades = await Propriedade.findAll({
            where: {
                id: propriedadeIds
            },
            include: {
                model: Gleba, 
                through: { attributes: [] } 
            }
        });
        
        const propriedadesComAcesso = propriedades.map((propriedade, index) => ({
            ...propriedade.toJSON(),
            access: acessos[index]
        }));
        
        //console.log(propriedadesComAcesso);

        if (propriedades.length === 0) {
            return res.status(404).json({ message: 'Nenhuma propriedade cadastrada para este usuário.' });
        }
        const resultado = propriedadesComAcesso.map(propriedade => {
            const glebas = propriedade.glebas || [];
            return {
                ...propriedade,
                glebas
            };
        });

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Erro ao buscar propriedades do usuário:', error);
        return res.status(500).json({ error: 'Erro ao buscar propriedades do usuário' });
    }
});

/*  Rota para --> BUSCA POR DETERMINADA GLEBA E SUAS SAFRAS */
app.get('/gleba/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const gleba = await Gleba.findByPk(id);
        if (!gleba) {
            return res.status(404).json({ error: 'Gleba não encontrada' });
        }

        //Procurando a propriedade que essa gleba pertence
        const propriedadeGleba = await PropriedadeGleba.findOne({
            where: { glebaId: id },
            attributes: ['propriedadeId']
        });

        const propriedadeId = propriedadeGleba?.propriedadeId;

        //Recebendo dados da propriedade
        const propriedade = await Propriedade.findByPk(propriedadeId);

        //Procurar dono da propriedade
        const ownerPropriedade = await UsuarioPropriedade.findOne({
            where: { propriedadeId: propriedadeId },
            attributes: ['usuarioId', 'access']
        }); 
        
        const userId = ownerPropriedade?.usuarioId

        const owner = await Usuario.findByPk(userId);
        if (!owner) {
            return res.status(404).json({ error: 'Dono da gleba não encontrado' });
        }
        
        const resposta = {
            gleba: gleba,
            propriedade: propriedade,
            owner: owner

        };

        return res.status(200).json(resposta);
    } catch (error) {
        console.error('Erro ao buscar gleba:', error);
        return res.status(500).json({ error: 'Erro ao buscar gleba' });
    }
});

/*  Rota para --> EDIÇÃO/UPDATE GLEBA */
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



/*------------------------
        ROTAS SAFRAS
--------------------------*/


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