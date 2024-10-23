const Sequelize = require("sequelize");
const connection = require("./database");

const Property = connection.define('properties',{
    name:{
        type: Sequelize.STRING,
        allowNull: false
    },city:{
        type: Sequelize.STRING,
        allowNull: false
    },area:{
        type: Sequelize.DOUBLE,
        allowNull: false
    }
});


module.exports = Property;