const Sequelize = require("sequelize");
const connection = require("./database");
const Usuario = require("./Usuario");
const UsuarioPropriedade = require("./UsuarioPropriedade");

const Propriedade = connection.define('propriedades',{
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

//Propriedade.sync({force:true});


module.exports = Propriedade;