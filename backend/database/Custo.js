const Sequelize = require("sequelize");
const connection = require("./database");

const Custo = connection.define('custos',{
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
    },tipo:{ //orçado/realizado
        type: Sequelize.STRING,
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