const Sequelize = require("sequelize");
const connection = require("./database");

const Usuario = connection.define('usuario',{
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

//Usuario.sync({force:true});

module.exports = Usuario;