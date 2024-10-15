// database/PropriedadeGleba.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('./database'); // Certifique-se de que este caminho esteja correto

class PropriedadeGleba extends Model {}

PropriedadeGleba.init({
    propriedadeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Propriedade', // Nome da tabela de Propriedade
            key: 'id',
        }
    },
    glebaId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Gleba', // Nome da tabela de Gleba
            key: 'id',
        }
    }
}, {
    sequelize,
    modelName: 'PropriedadeGleba',
    tableName: 'proprieade_gleba', // Nome da tabela no banco de dados
    timestamps: false, // Se não precisar de timestamps
});

module.exports = PropriedadeGleba;
