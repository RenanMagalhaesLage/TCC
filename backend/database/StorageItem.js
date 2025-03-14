const Sequelize = require("sequelize");
const connection = require("./database");

const StorageItem = connection.define('storage_items',{
    storedLocation: {
        type: Sequelize.STRING,
        allowNull: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    unit: { 
        type: Sequelize.STRING,
        allowNull: false
    },
    quantity: { 
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    category: { 
        type: Sequelize.STRING,
        allowNull: false
    },
    totalValue: { 
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    expirationDate: { //Realizar a viabilidade desse campo
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: Sequelize.NOW
    },
    note: {
        type: Sequelize.STRING,
        allowNull: true
    }
});


module.exports = StorageItem;