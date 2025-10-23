var Sequelize = require('sequelize');
var sequelize = require('../config/database');
const Posicao = require('./Posicao');

const Equipa = sequelize.define('equipa', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: Sequelize.STRING(512),
        allowNull: false,
    },
    ePropria: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
}, {
    timestamps: false,
});

Equipa.hasMany(Posicao, {foreignKey:{ name: 'idEquipa', allowNull: false}, as: 'posicoes', onDelete: 'CASCADE' }),

module.exports = Equipa