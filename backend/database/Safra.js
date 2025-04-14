const Sequelize = require("sequelize");
const connection = require("./database");

const Safra = connection.define('safra',{
    name:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    totalArea: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
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
    crop: {
        type: Sequelize.STRING,
        allowNull: false
    },
    seed: {
        type: Sequelize.STRING,
        allowNull: false
    },
    dosage: { // kg/ha
        type: Sequelize.INTEGER,
        allowNull: false
    },
    tons: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    fertilizer: {
        type: Sequelize.STRING,
        allowNull: false
    },
    plantingEndDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    harvestEndDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    fieldDuration: { // days
        type: Sequelize.INTEGER,
        allowNull: false
    },
    rainfall: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    moisture: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    impurity: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    damagedGrains: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    greenGrains: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    brokenGrains: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    expectedYield: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    actualYield: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    estimatedSalePrice: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    actualSalePrice: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
});



module.exports = Safra;