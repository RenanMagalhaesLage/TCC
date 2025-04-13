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

/*  Rota para --> GRÁFICO DE PIZZA DE CUSTOS */
router.get('/custos-pie-chart', async (req, res) => {
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
router.get('/all-custos-pie-chart', async (req, res) => {
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
router.get('/custos-glebas-line-chart', async (req, res) => {
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
router.get('/custos-glebas-bar-chart', async (req, res) => {
    const { safraId } = req.query;

    const safra = await Safra.findByPk(safraId);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrado' });
    }
    //console.log("safra type = " + safra.type);

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
router.get('/custos-hectares-glebas-bar-chart', async (req, res) => {
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
router.get('/custos-categoria-bar-chart', async (req, res) => {
    const { id } = req.query;

    const safra = await Safra.findByPk(id);
        if (!safra) {
            return res.status(404).json({ error: 'Safra não encontrado' });
    }
    console.log("teste" + safra);

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
router.get('/report-safra', async (req, res) => {
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
            precoVenda = safra.precoVendaEstimado;
            producao =  safra.prodPrevista;
        }else{
            precoVenda = safra.precoVendaRealizado;
            producao =  safra.prodRealizada;
        }

        const custoMedio = (sumCustos.totalCustos / safra.areaTotal);
        const receitaBruta = precoVenda * safra.areaTotal * producao;
        const lucroTotal = receitaBruta - sumCustos.totalCustos;
        const lucroHect = lucroTotal / safra.areaTotal;
        /* PONTO EQUILÍBRIO = CUSTO MÉDIO / PREÇO VENDA */
        const pontoEquilibrio = custoMedio / precoVenda;
        /* LAIR --> LUCRO ANTES DO IMPOSTO DE RENDA */
        const receitaHect = precoVenda * producao;
        const rentabilidadeLair = ((receitaHect - custoMedio) / custoMedio) *100;
        const funrural = receitaBruta*0.002;
        /* IMPOSTO DE RENDA --> (LUCRO TOTAL - FUNRURAL) * 20% */
        const importoRenda =  (lucroTotal - funrural) * 0.2;
        const lucroLiquido = lucroTotal - funrural - importoRenda;
        const lucroLiquidoHect = lucroLiquido / safra.areaTotal;
        const rentabilidadeTotal = lucroLiquidoHect / custoMedio;

        /* DIFERENÇA PRODUÇÃO ESTIMADO VS REALIZADO */
        const difProd = ((safra.prodRealizada - safra.prodPrevista) / safra.prodPrevista) * 100;

        const result = {
            areaTotal: formatarNumero(safra.areaTotal),
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
router.get('/report-custo', async (req, res) => {
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

        /* Querrys para custos de cada categoria */
        const corretivosFertilizantes = await connection.query(queryCategory, {
            replacements: { id, type, category: 'Corretivos e Fertilizantes' },  
            type: QueryTypes.SELECT  
        });

        const sementes = await connection.query(queryCategory, {
            replacements: { id, type, category: 'Sementes' },  
            type: QueryTypes.SELECT  
        });

        const defensivos = await connection.query(queryCategory, {
            replacements: { id, type, category: 'Defensivos' },  
            type: QueryTypes.SELECT  
        });

        const operacoes = await connection.query(queryCategory, {
            replacements: { id, type, category: 'Operações' },  
            type: QueryTypes.SELECT  
        });

        const administrativo = await connection.query(queryCategory, {
            replacements: { id, type, category: 'Administrativo' },  
            type: QueryTypes.SELECT  
        });

        const arrendamento = await connection.query(queryCategory, {
            replacements: { id, type, category: 'Arrendamento' },  
            type: QueryTypes.SELECT  
        });

        const descritivo  = await connection.query(queryDescritivo, {
            replacements: { id, type},  
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
      
        const totalValue = descritivo.reduce((sum, item) => sum + Number(item.value), 0);

        const resultDescritivo = categories.map(category => {
            const categoryFound = Array.isArray(descritivo) ? descritivo.find(result => result.category === category) : null;
            const value = categoryFound ? Number(categoryFound.value) : 0;
            const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

            return {
                category,
                value: formatarNumero(value),
                percentage: formatarNumero(percentage)
            };
        });

        let precoVenda = 0;
        let producao = 0;
        if(type === "Planejado"){
            precoVenda = safra.precoVendaEstimado;
            producao =  safra.prodPrevista;
        }else{
            precoVenda = safra.precoVendaRealizado;
            producao =  safra.prodRealizada;
        }

        const custoMedio = (sumCustos.totalCustos / safra.areaTotal);
        const receitaBruta = precoVenda * safra.areaTotal * producao;
        const receitaBrutaHec = precoVenda * producao;
        const lucroTotal = receitaBruta - sumCustos.totalCustos;
        const lucroHect = lucroTotal / safra.areaTotal;
        /* PONTO EQUILÍBRIO = CUSTO MÉDIO / PREÇO VENDA */
        const pontoEquilibrio = custoMedio / precoVenda;
        /* LAIR --> LUCRO ANTES DO IMPOSTO DE RENDA */
        const receitaHect = precoVenda * producao;
        const rentabilidadeLair = ((receitaHect - custoMedio) / custoMedio) *100;
        const funrural = receitaBruta*0.002;
        /* IMPOSTO DE RENDA --> (LUCRO TOTAL - FUNRURAL) * 20% */
        const importoRenda =  (lucroTotal - funrural) * 0.2;
        const lucroLiquido = lucroTotal - funrural - importoRenda;
        const lucroLiquidoHect = lucroLiquido / safra.areaTotal;
        const rentabilidadeTotal = lucroLiquidoHect / custoMedio;

        /* DIFERENÇA PRODUÇÃO ESTIMADO VS REALIZADO */
        const difProd = ((safra.prodRealizada - safra.prodPrevista) / safra.prodPrevista) * 100;

        const administrativoTotal = (administrativo.length > 0 && administrativo[0].total) || 0;
        const operacoesTotal = (operacoes.length > 0 && operacoes[0].total) || 0;
        
        const custoFinanceiro = (administrativoTotal + operacoesTotal) * 0.095; //(adm + operacao) * 9,5%

        const precoCusto = ((sumCustos.totalCustos / producao) / safra.areaTotal);
        const nomeAjuste = safra.type === "Realizado" ? "realizado" : "esperado";
        const nomeAjuste2 = safra.type === "Realizado" ? "realizada" : "esperada";

        const result = {
            safraName: safra.name,
            type: safra.type,
            status: safra.status,
            areaTotal: formatarNumero(safra.areaTotal),
            glebas: [],
            cultivo: safra.cultivo,
            corretivosFertilizantes: corretivosFertilizantes,
            sementes: sementes,
            defensivos: defensivos,
            operacoes: operacoes,
            administrativo: administrativo,
            arrendamento: arrendamento,
            descritivo: resultDescritivo,
            custoTotal: formatarNumero(sumCustos.totalCustos) || 0,
            custoFinanceiro: formatarNumero(custoFinanceiro),
            seguro: formatarNumero(sumCustos.totalCustos * 0.02),
            custoMedio:  formatarNumero(custoMedio),
            prod: formatarNumero(producao), 
            precoCusto: formatarNumero(precoCusto),

            rentabilidade: [
                { name: "Preço de venda " +  nomeAjuste + " (R$/saco)", value: formatarNumero(precoVenda)},
                { name: "Receita bruta " + nomeAjuste2 +  " (R$/ha)", value: formatarNumero(receitaBrutaHec) },
                { name: "Receita bruta total (Gleba)", value: formatarNumero(receitaBruta) },
                { name: "Lucro " +  nomeAjuste + " (R$/ha)", value: formatarNumero(lucroHect) },
                { name: "LAIR (R$)", value: formatarNumero(lucroTotal) },
            ],
            rentabilidadeLair: formatarNumero(rentabilidadeLair),

            rentabilidadeImposto:[
                {name: "Funrural (0,2%): ", value: formatarNumero(funrural)},
                {name: "Imposto de Renda: ", value: formatarNumero(importoRenda)},
                {name: "Lucro Liquido: ", value: formatarNumero(lucroLiquido)},
                {name: "Lucro Liquido / Hectare: ", value: formatarNumero(lucroLiquidoHect)},
            ],
            rentabilidadeFinal: formatarNumero(rentabilidadeTotal),
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