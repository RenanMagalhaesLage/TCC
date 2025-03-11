const Sequelize = require("sequelize");
const connection = require("./database");

const StorageItem = connection.define('storage_items',{
    stored_location: {
        type: Sequelize.STRING,
        allowNull: false
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
    total_value: { 
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    date: { //Realizar a viabilidade desse campo
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    note: {
        type: Sequelize.STRING,
        allowNull: false
    }
});


module.exports = StorageItem;