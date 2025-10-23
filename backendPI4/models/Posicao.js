var Sequelize = require('sequelize');
var sequelize = require('../config/database');
var Atleta = require('../models/Atleta');
var Equipa = require('../models/Equipa');

const Posicao = sequelize.define('posicao', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    numero: {
        type: Sequelize.SMALLINT,
        allowNull: false,
    },
}, {
    timestamps: false,
});

Posicao.belongsTo(Atleta, {foreignKey:{ name: 'idAtleta', allowNull: true}, as: 'atleta', onDelete: 'SET NULL' }),
module.exports = Posicao