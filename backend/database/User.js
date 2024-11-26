const Sequelize = require("sequelize");
const connection = require("./database");

const User = connection.define('users',{
    name:{
        type: Sequelize.STRING,
        allowNull: false
    },email:{
        type: Sequelize.STRING,
        allowNull: false
    },picture:{
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = User;