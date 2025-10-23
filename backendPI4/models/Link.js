var Sequelize = require('sequelize');
var sequelize = require('../config/database');
var Atleta = require('../models/Atleta');

const Link = sequelize.define('link', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    link: {
        type: Sequelize.STRING(512),
        allowNull: false,
    },
}, {
    timestamps: false,
});

Link.belongsTo(Atleta, {foreignKey: { name: 'idAtleta', allowNull: false }, as: 'atleta', onDelete: 'CASCADE'});
Atleta.hasMany(Link, { foreignKey: 'idAtleta', as: 'links' });

module.exports = Link