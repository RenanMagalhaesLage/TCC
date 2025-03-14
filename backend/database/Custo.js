const Sequelize = require("sequelize");
const connection = require("./database");

const Custo = connection.define('custos',{
    status:{
        type: Sequelize.BOOLEAN, //Safra finalizada ? Sim --> true
        allowNull: false,
    },
    type:{
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isIn: [['Planejado', 'Realizado']] 
        }
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
    date: { //Realizar a viabilidade desse campo
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    note: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

//Custo.sync({force:true});


module.exports = Custo;