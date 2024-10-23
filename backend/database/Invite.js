const Sequelize = require("sequelize");
const connection = require("./database");

const Invite = connection.define('invites',{
    senderId:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    reciverId:{
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = Invite;