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

/*  Rota para --> GRÁFICO DE PIZZA DE CUSTOS */
router.get('/custos-pie-chart', verifyToken, async (req, res) => {
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
            'Sementes',
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
router.get('/all-custos-pie-chart', verifyToken, async (req, res) => {
    const userEmail = req.user.email;

    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    /* Busca todas as propriedades associadas ao usuário e seus níveis de acesso*/
    const userProperties = await UserProperty.findAll({
        where: { userId: user.id },
        attributes: ['propertyId', 'access']
    });

    if(userProperties.length === 0){
        return res.status(404).json({ error: "Usuário não possui propriedades." });
    }

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

    let allSafrasEmpty = true;

    

    const safraIds = new Set();  

    properties.forEach(property => {
        property.glebas.forEach(gleba => {
            if (gleba.safras && gleba.safras.length > 0) {
                allSafrasEmpty = false;
            }
            gleba.safras.forEach(safra => {
                safraIds.add(safra.id);  
            });
        });
    });

    if (allSafrasEmpty) {
        return res.status(404).json({ error: "Usuário não possui safras realizadas." });
    } 

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

            const categories = [
                'Defensivos',
                'Operações',
                'Sementes',
                'Arrendamento',
                'Administrativo',
                'Corretivos e Fertilizantes'
            ];
          
            const result = categories.map(category => {
                const categoryFound = Array.isArray(sumCustos) ? sumCustos.find(result => result.category === category) : null;
                return {
                    id: category, 
                    label: category,
                    value: categoryFound ? categoryFound.value : 0 
                };
            });
            const allValuesAreZero = result.every(item => item.value === 0);

            if (allValuesAreZero) {
                return res.status(404).json({ error: "Safras não possuem custos." });
            } 
            return res.json(result);

        } catch (error) {
          console.error(`Erro ao buscar custos para safraId ${safraId}:`, error);
        }
    }
});

/*  Rota para --> GRÁFICO DE LINHA DE CUSTOS POR GLEBA */
router.get('/custos-glebas-line-chart', verifyToken, async (req, res) => {
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
            'Sementes',
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
router.get('/custos-glebas-bar-chart', verifyToken, async (req, res) => {
    const { safraId, safraType } = req.query;

    const safra = await Safra.findByPk(safraId);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrado' });
    }

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
            replacements: { safraId, type: safraType },  
            type: QueryTypes.SELECT  
        });
        console.log(JSON.stringify(sumCustos, null, 2));

        sumCustos.forEach(item => {
            if (item.category === 'Corretivos e Fertilizantes') {
                item.category = 'Corr. e Fert.';
            }
        });

        const categories = [
            'Defensivos',
            'Operações',
            'Sementes',
            'Arrendamento',
            'Administrativo',
            'Corr. e Fert.'
        ];
         
        const glebaIds = [...new Set(sumCustos.map(item => item.glebaId))];

        const glebasInfo = await Gleba.findAll({
            where: {
                id: glebaIds
            },
            attributes: ['id', 'name']
        });

        const result = glebasInfo.map(gleba => {
            const glebaData = {
                gleba: gleba.name
            };
    
            categories.forEach(category => {
                const categoryFound = sumCustos.find(item => item.glebaId === gleba.id && item.category === category);
                glebaData[category.toLowerCase()] = categoryFound ? categoryFound.value.toFixed(2) : 0; 
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
router.get('/custos-hectares-glebas-bar-chart', verifyToken, async (req, res) => {
    const { safraId, safraType } = req.query;

    const safra = await Safra.findByPk(safraId);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrado' });
    }

    //Somando custos por categoria
    const query = `
        SELECT 
            sg.glebaId,  
            g.area,
            IFNULL(SUM(c.totalValue), 0) AS value,
            IFNULL(SUM(c.totalValue), 0) / NULLIF(g.area, 0) AS value_per_hectare
        FROM 
            (SELECT DISTINCT glebaId FROM safra_glebas WHERE safraId = :safraId) AS sg
        JOIN 
            glebas AS g ON g.id = sg.glebaId
        LEFT JOIN 
            Custos AS c ON 
                c.glebaId = sg.glebaId 
                AND c.safraId = :safraId
                AND c.type = :type
        GROUP BY 
            sg.glebaId, g.area;
    `;
  
    try {
        const sumCustos = await connection.query(query, {
            replacements: { safraId, type: safraType },  
            type: QueryTypes.SELECT  
        });
         
        const glebaIds = [...new Set(sumCustos.map(item => item.glebaId))];

        const glebasInfo = await Gleba.findAll({
            where: {
                id: glebaIds
            },
            attributes: ['id', 'name']
        });

        const result = glebasInfo.map(gleba => {
            const glebaData = {
                gleba: gleba.name
            };

            sumCustos.forEach(item => {
                if (item.glebaId === gleba.id) {
                    glebaData["custo"] = item.value_per_hectare.toFixed(2); 
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

/* Rota para --> GRÁFICO DE BARRA DE CUSTO POR GLEBA */
router.get('/custos-categoria-bar-chart', verifyToken, async (req, res) => {
    const { id } = req.query;

    const safra = await Safra.findByPk(id);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrado' });
    }

    //Somando custos por categoria
    const query = `
       SELECT category, SUM(totalValue) AS value
        FROM Custos
        WHERE safraId = :id
        AND type = 'Realizado'
        GROUP BY category;
    `;
  
    try {
        const sumCustos = await connection.query(query, {
          replacements: { id },  
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

/* Rota para --> RELATÓRIO DE SAFRA */
router.get('/report-safra', verifyToken, async (req, res) => {
    const { id } = req.query;

    const safra = await Safra.findByPk(id);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrado' });
    }

    const query = `
        SELECT SUM(totalValue) AS totalCustos
        FROM custos
        WHERE safraId = :id
        AND type = :type;
    `;
  
    try {
        const type = safra.type;
        const [sumCustos] = await connection.query(query, {
          replacements: { id, type },  
          type: QueryTypes.SELECT  
        });

        let precoVenda = 0;
        let producao = 0;
        if(type === "Planejado"){
            precoVenda = safra.estimatedSalePrice;
            producao =  safra.expectedYield;
        }else{
            precoVenda = safra.actualSalePrice;
            producao =  safra.actualYield;
        }

        const custoMedio = (sumCustos.totalCustos / safra.totalArea);
        const receitaBruta = precoVenda * safra.totalArea * producao;
        const lucroTotal = receitaBruta - sumCustos.totalCustos;
        const lucroHect = lucroTotal / safra.totalArea;
        /* PONTO EQUILÍBRIO = CUSTO MÉDIO / PREÇO VENDA */
        const pontoEquilibrio = custoMedio / precoVenda;
        /* LAIR --> LUCRO ANTES DO IMPOSTO DE RENDA */
        const receitaHect = precoVenda * producao;
        const rentabilidadeLair = ((receitaHect - custoMedio) / custoMedio) *100;
        const funrural = receitaBruta*0.002;
        /* IMPOSTO DE RENDA --> (LUCRO TOTAL - FUNRURAL) * 20% */
        const importoRenda =  (lucroTotal - funrural) * 0.2;
        const lucroLiquido = lucroTotal - funrural - importoRenda;
        const lucroLiquidoHect = lucroLiquido / safra.totalArea;
        const rentabilidadeTotal = (lucroLiquidoHect / custoMedio) *100;

        /* DIFERENÇA PRODUÇÃO ESTIMADO VS REALIZADO */
        const difProd = ((safra.actualYield - safra.expectedYield) / safra.expectedYield) * 100;

        const result = {
            totalArea: formatarNumero(safra.totalArea),
            precoVenda: formatarNumero(precoVenda),
            custoTotal: formatarNumero(sumCustos.totalCustos) || 0,
            custoMedio:  formatarNumero(custoMedio),
            prodEstimada: formatarNumero(producao), 
            pontoEquilibrio: formatarNumero(pontoEquilibrio),
            receitaBruta: formatarNumero(receitaBruta),
            lucroTotal: formatarNumero(lucroTotal),
            lucroHect: formatarNumero(lucroHect),
            rentabilidadeLair: formatarNumero(rentabilidadeLair),
            rentabilidadeFinal: formatarNumero(rentabilidadeTotal),
            difProd : formatarNumero(difProd)

        };
      
        return res.json(result);
        

    } catch (error) {
        console.error('Erro ao executar a consulta:', error);
        res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
    }
});

/* Rota para --> RELATÓRIO DE CUSTO TOTAL */
router.get('/report-custo', verifyToken, async (req, res) => {
    const { id } = req.query;

    const safra = await Safra.findByPk(id);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrado' });
    }

    const query = `
        SELECT SUM(totalValue) AS totalCustos
        FROM custos
        WHERE safraId = :id
        AND type = :type;
    `;

    const queryCategory =`
        SELECT *,
        SUM(totalValue) OVER () AS total
        FROM custos
        WHERE safraId = :id
        AND type = :type
        AND category = :category;
    `;

    const queryDescritivo = `
        SELECT category, SUM(totalValue) AS value
        FROM Custos
        WHERE safraId = :id
        AND type = :type
        GROUP BY category;
    `;
  
    try {
        const type = safra.type;
        const [sumCustos] = await connection.query(query, {
          replacements: { id, type },  
          type: QueryTypes.SELECT  
        });

        const formatCurrency = (value) => {
            return value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });
        };

        /* Querrys para custos de cada categoria */
        const corretivosFertilizantes = await connection.query(queryCategory, {
            replacements: { id, type, category: 'Corretivos e Fertilizantes' },  
            type: QueryTypes.SELECT  
        });

        const resultCorretivosFertilizantes = corretivosFertilizantes.map(item => ({
            ...item, 
            price: formatCurrency(item.price), 
            totalValue: formatCurrency(item.totalValue),
            total: formatCurrency(item.total), 
        }));

        const sementes = await connection.query(queryCategory, {
            replacements: { id, type, category: 'Sementes' },  
            type: QueryTypes.SELECT  
        });

        const resultSementes = sementes.map(item => ({
            ...item, 
            price: formatCurrency(item.price), 
            totalValue: formatCurrency(item.totalValue),
            total: formatCurrency(item.total), 
        }));

        const defensivos = await connection.query(queryCategory, {
            replacements: { id, type, category: 'Defensivos' },  
            type: QueryTypes.SELECT  
        });

        const resultDefensivos = defensivos.map(item => ({
            ...item, 
            price: formatCurrency(item.price), 
            totalValue: formatCurrency(item.totalValue),
            total: formatCurrency(item.total), 
        }));

        const operacoes = await connection.query(queryCategory, {
            replacements: { id, type, category: 'Operações' },  
            type: QueryTypes.SELECT  
        });

        const resultOperacoes = operacoes.map(item => ({
            ...item, 
            price: formatCurrency(item.price), 
            totalValue: formatCurrency(item.totalValue),
            total: formatCurrency(item.total), 
        }));

        const administrativo = await connection.query(queryCategory, {
            replacements: { id, type, category: 'Administrativo' },  
            type: QueryTypes.SELECT  
        });

        const resultAdministrativo = administrativo.map(item => ({
            ...item, 
            price: formatCurrency(item.price), 
            totalValue: formatCurrency(item.totalValue),
            total: formatCurrency(item.total), 
        }));

        const arrendamento = await connection.query(queryCategory, {
            replacements: { id, type, category: 'Arrendamento' },  
            type: QueryTypes.SELECT  
        });

        const resultArrendamento = arrendamento.map(item => ({
            ...item, 
            price: formatCurrency(item.price), 
            totalValue: formatCurrency(item.totalValue),
            total: formatCurrency(item.total), 
        }));

        const descritivo  = await connection.query(queryDescritivo, {
            replacements: { id, type},  
            type: QueryTypes.SELECT  
        });

        const categories = [
            'Defensivos',
            'Operações',
            'Sementes',
            'Arrendamento',
            'Administrativo',
            'Corretivos e Fertilizantes'
        ];
      
        const totalValue = descritivo.reduce((sum, item) => sum + Number(item.value), 0);

        const resultDescritivo = categories.map(category => {
            const categoryFound = Array.isArray(descritivo) ? descritivo.find(result => result.category === category) : null;
            const value = categoryFound ? Number(categoryFound.value) : 0;
            const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

            return {
                category,
                value: formatCurrency(value),
                percentage: formatarNumero(percentage)
            };
        });

        let precoVenda = 0;
        let producao = 0;
        if(type === "Planejado"){
            precoVenda = safra.estimatedSalePrice;
            producao =  safra.expectedYield;
        }else{
            precoVenda = safra.actualSalePrice;
            producao =  safra.actualYield;
        }

        const custoMedio = (sumCustos.totalCustos / safra.totalArea);
        const receitaBruta = precoVenda * safra.totalArea * producao;
        const receitaBrutaHec = precoVenda * producao;
        const lucroTotal = receitaBruta - sumCustos.totalCustos;
        const lucroHect = lucroTotal / safra.totalArea;
        /* PONTO EQUILÍBRIO = CUSTO MÉDIO / PREÇO VENDA */
        const pontoEquilibrio = custoMedio / precoVenda;
        /* LAIR --> LUCRO ANTES DO IMPOSTO DE RENDA */
        const receitaHect = precoVenda * producao;
        const rentabilidadeLair = ((receitaHect - custoMedio) / custoMedio) *100;
        const funrural = receitaBruta*0.002;
        /* IMPOSTO DE RENDA --> (LUCRO TOTAL - FUNRURAL) * 20% */
        const importoRenda =  (lucroTotal - funrural) * 0.2;
        const lucroLiquido = lucroTotal - funrural - importoRenda;
        const lucroLiquidoHect = lucroLiquido / safra.totalArea;
        const rentabilidadeTotal = (lucroLiquidoHect / custoMedio) *100;

        /* DIFERENÇA PRODUÇÃO ESTIMADO VS REALIZADO */
        const difProd = ((safra.prodRealizada - safra.prodPrevista) / safra.prodPrevista) * 100;

        const administrativoTotal = (administrativo.length > 0 && administrativo[0].total) || 0;
        const operacoesTotal = (operacoes.length > 0 && operacoes[0].total) || 0;
        
        const custoFinanceiro = (administrativoTotal + operacoesTotal) * 0.095; //(adm + operacao) * 9,5%
        const custoSeguro = sumCustos.totalCustos * 0.02 // seguro de 2%

        const precoCusto = ((sumCustos.totalCustos / producao) / safra.totalArea);
        const nomeAjuste = safra.type === "Realizado" ? "realizado" : "esperado";
        const nomeAjuste2 = safra.type === "Realizado" ? "realizada" : "esperada";
        const total = sumCustos.totalCustos + custoFinanceiro + custoSeguro; //soma de todos os gastos

        const result = {
            name: safra.name,
            type: safra.type,
            status: safra.status,
            totalArea: formatarNumero(safra.totalArea),
            glebas: [],
            crop: safra.crop,
            corretivosFertilizantes: resultCorretivosFertilizantes,
            sementes: resultSementes,
            defensivos: resultDefensivos,
            operacoes: resultOperacoes,
            administrativo: resultAdministrativo,
            arrendamento: resultArrendamento,
            descritivo: resultDescritivo,
            custoTotal: formatarNumero(sumCustos.totalCustos) || 0,
            custoFinanceiro: formatarNumero(custoFinanceiro),
            seguro: formatarNumero(custoSeguro),
            custoMedio:  formatarNumero(custoMedio),
            prod: formatarNumero(producao), 
            precoCusto: formatarNumero(precoCusto),

            rentabilidade: [
                { name: "Preço de venda " +  nomeAjuste + " (R$/saco)", value: formatCurrency(precoVenda)},
                { name: "Receita bruta " + nomeAjuste2 +  " (R$/ha)", value: formatCurrency(receitaBrutaHec) },
                { name: "Receita bruta total", value: formatCurrency(receitaBruta) },
                { name: "Lucro " +  nomeAjuste + " (R$/ha)", value: formatCurrency(lucroHect) },
                { name: "LAIR (R$)", value: formatCurrency(lucroTotal) },
            ],
            rentabilidadeLair: formatarNumero(rentabilidadeLair),

            rentabilidadeImposto:[
                {name: "Funrural (0,2%): ", value: formatCurrency(funrural)},
                {name: "Imposto de Renda: ", value: formatCurrency(importoRenda)},
                {name: "Lucro Liquido: ", value: formatCurrency(lucroLiquido)},
                {name: "Lucro Liquido / Hectare: ", value: formatCurrency(lucroLiquidoHect)},
            ],
            rentabilidadeFinal: formatarNumero(rentabilidadeTotal),
            total: formatarNumero(total)
        };
      
        return res.json(result);
        

    } catch (error) {
        console.error('Erro ao executar a consulta:', error);
        res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
    }
});

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

module.exports = router;