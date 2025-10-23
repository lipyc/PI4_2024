var Sequelize = require('sequelize');
var sequelize = require('../config/database');
var Atleta = require('../models/Atleta');
var Clube = require('../models/Clube');
var Utilizador = require('../models/Utilizador');

var Tarefa = sequelize.define('tarefa', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    data: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    horaInicio: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    horaFim: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    jogaCasa: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
},
    {
        timestamps: false,
    });

Tarefa.belongsTo(Atleta, {foreignKey:{ name: 'idAtleta', allowNull: false}, as: 'atleta', onDelete: 'CASCADE' }),
Tarefa.belongsTo(Clube, {foreignKey:{ name: 'idClube', allowNull: true}, as: 'clube', onDelete: 'SET NULL' }),
Tarefa.belongsTo(Utilizador, {foreignKey:{ name: 'idUtilizador', allowNull: false}, as: 'utilizador', onDelete: 'CASCADE' }),

module.exports = Tarefa