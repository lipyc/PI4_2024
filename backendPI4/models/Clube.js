var Sequelize = require('sequelize');
var sequelize = require('../config/database');

const Clube = sequelize.define('clube', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: Sequelize.STRING(512),
        allowNull: false,
    },
    icon: {
        type: Sequelize.STRING(512),
        allowNull: true,
    },
}, {
    timestamps: false,
});

module.exports = Clube