var Sequelize = require('sequelize');
var sequelize = require('../config/database');
var Atleta = require('../models/Atleta');

const Relatorio = sequelize.define('relatorio', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    tecnica: {
        type: Sequelize.SMALLINT,
        allowNull: false,
    },
    velocidade: {
        type: Sequelize.SMALLINT,
        allowNull: false,
    },
    atitudeCompetitiva: {
        type: Sequelize.SMALLINT,
        allowNull: false,
    },
    inteligencia: {
        type: Sequelize.SMALLINT,
        allowNull: false,
    },
    altura: {
        type: Sequelize.SMALLINT,
        allowNull: false,
    },
    morfologia: {
        type: Sequelize.SMALLINT,
        allowNull: false,
    },
    data: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    avaliacaoFinal: {
        type: Sequelize.SMALLINT,
        allowNull: false,
    },
}, {
    timestamps: false,
});

Relatorio.belongsTo(Atleta, {foreignKey:{ name: 'idAtleta', allowNull: false}, as: 'atleta', onDelete: 'CASCADE' }),

module.exports = Relatorio