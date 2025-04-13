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

/*  Rota para --> BUSCAR SAFRA POR ID*/
router.get('/safras/:id', async (req, res) => {
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
router.get('/safras-by-user', async (req, res) => {
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
router.post('/safras', async (req, res) => {
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
router.put('/safras', async (req, res) => {
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
router.delete('/safras/:id', async(req,res) =>{
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

module.exports = router;