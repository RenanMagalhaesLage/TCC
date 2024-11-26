const Sequelize = require("sequelize");
const connection = require("./database");

const UserProperty = connection.define('user_properties', {
    access: {
        type: Sequelize.STRING,
        allowNull: false, 
        validate: {
            isIn: [['owner', 'guest']] 
        }
    }
});

module.exports = UserProperty;
