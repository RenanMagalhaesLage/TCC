const Sequelize = require("sequelize");
const connection = require("./database");

const Gleba = connection.define('glebas',{
    name:{
        type: Sequelize.STRING,
        allowNull: false
    },
    area:{
        type: Sequelize.DOUBLE,
        allowNull: false
    }
});

//Gleba.sync({force:true});
//Uma gleba pertence apenas a uma fazenda, entretanto uma fazenda pode possuir uma ou várias glebas
//Uma gleba possui varias safras

module.exports = Gleba;