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

/*  Rota para --> BUSCAR SAFRA POR ID*/
router.get('/safras/:id', verifyToken, async (req, res) => {
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
router.get('/safras-by-user', verifyToken, async (req, res) => {
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
router.post('/safras', verifyToken, async (req, res) => {
    try {
        const { 
            email, 
            glebaIds, 
            name,
            crop, 
            seed,
            dosage,
            tons,
            fertilizer,
            plantingEndDate,
            harvestEndDate,
            fieldDuration,
            expectedYield, 
            estimatedSalePrice,
        } = req.body;
        const user = await User.findOne({ where: { email: email } });

        const ids = glebaIds.map(id => Number(id));

        const totalArea = await Gleba.sum('area', {
            where: {
              id: ids
            }
        });

        if (
            !email || !glebaIds || !name || !crop || !seed  || !dosage || !tons || 
            !fertilizer || !plantingEndDate || !harvestEndDate || !fieldDuration  || !expectedYield || !estimatedSalePrice
        ) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        const newSafra = await Safra.create({
            type: "Planejado",
            name: name,
            totalArea: totalArea,
            status: false,
            crop: crop,
            seed: seed,
            dosage: dosage,
            tons: tons,
            fertilizer: fertilizer,
            plantingEndDate: plantingEndDate,
            harvestEndDate: harvestEndDate,
            fieldDuration: fieldDuration,
            expectedYield: expectedYield,
            estimatedSalePrice: estimatedSalePrice,
            rainfall: 0,  
            moisture: 0,         
            impurity: 0,        
            damagedGrains: 0,   
            greenGrains: 0,     
            brokenGrains: 0,    
            actualYield: 0,
            actualSalePrice: 0,
        });

        if (glebaIds && glebaIds.length > 0) {
            for (let glebaId of glebaIds) {
                await SafraGleba.create({
                    safraId: newSafra.id,   
                    glebaId: glebaId, 
                    status: newSafra.status    
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
router.put('/safras', verifyToken, async (req, res) => {
    try {
        const { 
            id, 
            type,
            glebas,
            name,
            status, 
            crop, 
            seed,
            dosage,
            tons,
            fertilizer,
            plantingEndDate,
            harvestEndDate,
            fieldDuration,
            expectedYield,
            actualYield,
            rainfall,  
            moisture,          
            impurity,         
            damagedGrains,   
            greenGrains, 
            brokenGrains, 
            estimatedSalePrice,
            actualSalePrice
        } = req.body;

        let areaGleba = 0;
        //Adicionando primeiro a(s) gleba(s)
        if (glebas && glebas.length > 0) {
            for (let glebaId of glebas) {
                await SafraGleba.create({
                    safraId: id,   
                    glebaId: glebaId, 
                    status: status    
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
            //Caso for finalizar a safra atualizar status das glebas e dos seus custos
            const [glebasUpdated] = await SafraGleba.update(
                { status: status},
                { where: { safraId: id } }
            )

            const [custosUpdated] = await Custo.update(
                { status: status},
                { where: { safraId: id } }
            )
        }

        const safra = await Safra.findByPk(id);
        const totalArea = safra.totalArea + areaGleba;

        const [updated] = await Safra.update(
            { 
                name,
                totalArea,
                type,
                status,
                crop,
                seed,
                dosage,
                tons,
                fertilizer,
                plantingEndDate,
                harvestEndDate,
                fieldDuration,
                expectedYield,
                actualYield,
                rainfall,  
                moisture,          
                impurity,         
                damagedGrains,   
                greenGrains, 
                brokenGrains,   
                estimatedSalePrice,
                actualSalePrice
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
router.delete('/safras', verifyToken, async(req,res) =>{
    const { id }  = req.query;
    try {
        const safra = await Safra.findByPk(id);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrada.' });
        }

        await SafraGleba.destroy({
            where: {
                safraId: id
            }
        });

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

module.exports = router;