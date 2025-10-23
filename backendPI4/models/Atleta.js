var Sequelize = require('sequelize');
var sequelize = require('../config/database');
var Clube = require('../models/Clube');
var Escalao = require('../models/Escalao');

var Atleta = sequelize.define('atleta', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true,
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    dataNascimento: {
        type: Sequelize.DATE
    },
    anoNascimento: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    nacionalidade: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    posicao: {
        type: Sequelize.INTEGER
    },
    nomeAgente: {
        type: Sequelize.STRING
    },
    numeroAgente: {
        type: Sequelize.STRING
    },
    avaliacaoFinal: {
        type: Sequelize.INTEGER
    },
},
    {
        timestamps: false,
    });

Atleta.belongsTo(Clube, {foreignKey:{ name: 'idClube', allowNull: true}, as: 'clube', onDelete: 'SET NULL'}),
Atleta.belongsTo(Escalao, {foreignKey:{ name: 'idEscalao', allowNull: true}, as: 'escalao', onDelete: 'SET NULL'})

module.exports = Atleta