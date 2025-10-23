var Sequelize = require('sequelize');
var sequelize = require('../config/database');

const Escalao = sequelize.define('escalao', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: Sequelize.STRING(512),
        allowNull: false,
    },
    idadeMax: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    idadeMin: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: false,
});

module.exports = Escalao
