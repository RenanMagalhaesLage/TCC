const express = require("express");
const router = express.Router();
const connection = require("../database/database");
const { QueryTypes } = require('sequelize');
const { Op } = require("sequelize");
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

/* Rota para --> BUSCAR PROPRIEDADE 
   Retorno: Propriedade, Glebas e Users associados à Propriedade */
router.get('/properties',verifyToken, async (req, res) => {
    const { id }  = req.query;

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
router.get('/properties-invites',verifyToken, async (req, res) => {
    const userEmail = req.user.email;
    try{
        const user = await User.findOne({ where: { email: userEmail } });
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
router.get('/properties-by-safra',verifyToken, async (req, res) => {
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
router.post('/properties',verifyToken, async (req, res) => {
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
router.put('/properties',verifyToken, async (req, res) => {
    try {
        const {id, name, area, city } = req.body;
        const [updated] = await Property.update(
            { name, area, city},
            { where: { id: id } }
        );


        if (updated) {
            const updatedProperty = await Property.findByPk(id);
            return res.json(updatedProperty);
        }

        res.status(404).json({ message: 'Propriedade não encontrada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* Rota para --> REMOVER PROPRIEDADE */
router.delete('/properties',verifyToken, async(req,res) =>{
    const { id }  = req.query;
    try {
        const propriedade = await Property.findByPk(id);
        if (!propriedade) {
            return res.status(404).json({ error: 'Propriedade não encontrada.' });
        };

        await StorageItem.destroy({
            where: { propertyId: id }
        });

        await Invite.destroy({
            where: { propertyId: id }
        });

        const glebas = await Gleba.findAll({
            where: { propertyId: id }
        });
        const glebasIds = glebas.map(gleba => gleba.id);

        await SafraGleba.destroy({
            where: {
              glebaId: {
                [Op.in]: glebasIds
              }
            }
        });

        await Custo.destroy({
            where: {
                glebaId: {
                  [Op.in]: glebasIds
                }
            }
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
router.delete('/user-properties',verifyToken, async(req,res) =>{
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

module.exports = router;