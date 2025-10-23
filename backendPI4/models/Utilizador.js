var Sequelize = require('sequelize');
var sequelize = require('../config/database');

const Utilizador = sequelize.define('utilizador', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: Sequelize.STRING(512),
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING(512),
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING(512),
        allowNull: false,
    },
    tipoUtilizador: {
        type: Sequelize.SMALLINT,
        allowNull: false,
    },
}, {
    timestamps: false,
});

module.exports = Utilizador