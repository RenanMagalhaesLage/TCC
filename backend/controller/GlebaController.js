const express = require("express");
const router = express.Router();
const connection = require("../database/database");
const { QueryTypes } = require('sequelize');
/*-------------------------------
            Models
---------------------------------*/
const User = require("../database/User");
const Property = require("../database/Property");
const UserProperty = require("../database/UserProperty");
const Gleba = require("../database/Gleba");
const Safra = require("../database/Safra");
const Invite = require("../database/Invite");
const Custo = require("../database/Custo");
const SafraGleba = require("../database/SafraGleba");
const StorageItem = require("../database/StorageItem");

/*  Rota para --> BUSCAR GLEBA */
router.get('/glebas/:id', async (req, res) => {
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
router.get('/glebas-available', async (req, res) => {
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
            .filter(gleba => gleba.status === true) 
            .map(gleba => gleba.glebaId); 
        
        const glebaIdsFiltrados = glebaIdsComStatusTrue.filter(glebaId => {
            return !glebasComStatus.some(gleba => gleba.glebaId === glebaId && gleba.status === false);
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
router.get('/glebas-by-safra', async (req, res) => {
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
router.post('/glebas', async (req, res) => {
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
router.put('/glebas/:id', async (req, res) => {
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
router.delete('/glebas', async(req,res) =>{
    const { id }  = req.query;
    try {
        const gleba = await Gleba.findByPk(id);
        if (!gleba) {
            return res.status(404).json({ error: 'Gleba não encontrada.' });
        }

        await SafraGleba.destroy({
            where: {
              glebaId: id
            }
        });

        await Custo.destroy({
            where: {
                glebaId: id
            }
        });

        await gleba.destroy();
        res.status(200).json({ message: 'Gleba deletada com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

module.exports = router;