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

/*  Rota para --> BUSCAR ESTOQUE DO USUÁRIO*/
router.get('/storage-by-user', async (req, res) => {
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
router.get('/storage-by-id', async (req, res) => {
    const { id }  = req.query;
    
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
router.post('/storage', async (req,res) => {
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
router.put('/storage', async (req,res) => {
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
router.delete('/storage', async(req,res) =>{
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
router.post('/storage-custo', async (req,res) => {
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

module.exports = router;