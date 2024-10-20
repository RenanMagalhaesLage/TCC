const Sequelize = require("sequelize");
const connection = require("./database");

const Safra = connection.define('safras',{
    type:{
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isIn: [['Planejado', 'Realizado']] 
        }
    },
    status:{
        type: Sequelize.BOOLEAN, //Safra finalizada ? Sim --> true
        allowNull: false,
    },
    cultivo:{
        type: Sequelize.STRING,
        allowNull: false
    },semente:{
        type: Sequelize.STRING,
        allowNull:false
    },metroLinear:{
        type: Sequelize.STRING,
        allowNull:false
    },dosagem:{ //kg/ha
        type: Sequelize.INTEGER,
        allowNull:false
    },toneladas:{
        type: Sequelize.DOUBLE,
        allowNull:false
    },adubo:{
        type: Sequelize.STRING,
        allowNull:false
    },dataFimPlantio:{
        type: Sequelize.DATEONLY,
        allowNull:false,
        defaultValue: Sequelize.NOW
    },dataFimColheita:{
        type: Sequelize.DATEONLY,
        allowNull:false,
        defaultValue: Sequelize.NOW
    },tempoLavoura:{ //dias
        type: Sequelize.INTEGER,
        allowNull:false
    },precMilimetrica:{
        type: Sequelize.INTEGER,
        allowNull:false
    },umidade:{
        type: Sequelize.DOUBLE,
        allowNull:false
    },impureza:{
        type: Sequelize.DOUBLE,
        allowNull:false
    },graosAvariados:{
        type: Sequelize.DOUBLE,
        allowNull:false
    },graosEsverdeados:{
        type: Sequelize.DOUBLE,
        allowNull:false
    },graosQuebrados:{
        type: Sequelize.DOUBLE,
        allowNull:false
    },prodTotal:{
        type: Sequelize.INTEGER,
        allowNull:false
    },prodPrevista:{
        type: Sequelize.DOUBLE,
        allowNull:false
    },prodRealizada:{
        type: Sequelize.DOUBLE,
        allowNull:false
    },porcentHect:{ //% Produto /hectare
        type: Sequelize.DOUBLE,
        allowNull:false
    },
});



module.exports = Safra;