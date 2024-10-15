const Sequelize = require("sequelize");
const connection = require("./database");
const Usuario = require("./Usuario");
const Propriedade = require("./Propriedade");

const UsuarioPropriedade = connection.define('usuario_propriedade', {
    access: {
        type: Sequelize.STRING,
        allowNull: false, 
        validate: {
            isIn: [['owner', 'guest']] 
        }
    }
});

// Relacionamentos muitos para muitos

//UsuarioPropriedade.sync({force: true});

module.exports = UsuarioPropriedade;
