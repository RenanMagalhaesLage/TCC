const Sequelize = require("sequelize");
const connection = require("./database");

const SafraGleba = connection.define('safra_glebas',{
    statusSafra:{
        type: Sequelize.BOOLEAN, //Safra finalizada ? Sim --> true
        allowNull: false,
    }
});



module.exports = SafraGleba;