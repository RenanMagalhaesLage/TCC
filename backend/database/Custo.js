const Sequelize = require("sequelize");
const connection = require("./database");

const Custo = connection.define('custos',{
    status:{
        type: Sequelize.BOOLEAN, //Safra finalizada ? Sim --> true
        allowNull: false,
    },
    name:{
        type: Sequelize.STRING,
        allowNull: false
    },unidade:{
        type: Sequelize.STRING,
        allowNull: false
    },quantidade:{
        type: Sequelize.DOUBLE,
        allowNull: false
    },preco:{
        type: Sequelize.DOUBLE,
        allowNull: false
    },categoria:{
        type: Sequelize.STRING,
        allowNull: false
    },valorTotal:{
        type: Sequelize.STRING,
        allowNull: false
    },data:{
        type: Sequelize.DATEONLY,
        allowNull:false,
        defaultValue: Sequelize.NOW
    },observacao:{
        type: Sequelize.STRING,
        allowNull: false
    }
});

//Custo.sync({force:true});


module.exports = Custo;