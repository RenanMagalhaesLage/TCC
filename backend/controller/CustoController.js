const express = require("express");
const router = express.Router();
const connection = require("../database/database");
const { QueryTypes } = require('sequelize');
const verifyToken = require('../middlewares/verifyToken');
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

/* Rota para --> BUSCAR CUSTO POR ID*/
router.get('/custos', verifyToken, async (req, res) => {
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
router.get('/custos-by-user', verifyToken, async (req, res) => {
    const userEmail = req.user.email;

    try {
        const user = await User.findOne({ where: { email: userEmail } });
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
router.post('/custos', verifyToken, async (req, res) => {
    try {
        const { 
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

        if (
            !email || !safraId || !glebaId || !name || !category || !unit || !quantity || !price || !totalValue 
        ) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
        const safra = await Safra.findByPk(safraId);

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
router.put('/custos', verifyToken, async (req, res) => {
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
router.delete('/custos/:id', verifyToken, async(req,res) =>{
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

module.exports = router;