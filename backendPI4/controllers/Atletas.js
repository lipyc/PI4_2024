'use strict';

var Atletas = require('../models/Atleta.js');
var Links = require('../models/Link.js');
var Clube = require('../models/Clube.js');
const { autenticarJWT } = require('../utils/authMiddleware');
const { Op } = require('sequelize');
const Escalao = require('../models/Escalao.js');
const Relatorios = require('../models/Relatorio.js');
const { Sequelize } = require("sequelize");

const controllers = {};

controllers.apagarAtleta = async (req, res) => {
    try {
        const id = req.openapi.pathParams.id;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem criar atletas.",
            });
        }

        const Atleta = await Atletas.findOne({ where: { id } });
        if (!Atleta) {
            return res.status(404).json({
                success: false,
                message: "Atleta não encontrado.",
            });
        }

        await Links.destroy({ where: { idAtleta: id } });

        await Atletas.destroy({ where: { id } });

        return res.status(204).json({
            success: true,
            message: "Atleta apagado com sucesso.",
        });
    } catch (error) {
        console.error("[ERRO AO APAGAR ATLETA]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.criarAtleta = async (req, res) => {
    try {
        const { nome, dataNascimento, anoNascimento, nacionalidade, posicao, nomeAgente, numeroAgente, idClube, idEscalao, links } = req.body;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores e olheiros podem criar atletas.",
            });
        }

        if (!nome || !anoNascimento || !nacionalidade) {
            return res.status(400).json({
                success: false,
                message: "Dados inválidos - Todos os campos obrigatórios devem ser fornecidos.",
            });
        }

        if (nome.length < 3) {
            return res.status(400).json({
                success: false,
                message: "O nome do atleta deve ter pelo menos 3 caracteres.",
            });
        }

        const novoAtleta = await Atletas.create({
            nome,
            dataNascimento: dataNascimento || null,
            anoNascimento,
            nacionalidade,
            posicao: posicao || null,
            nomeAgente: nomeAgente || null,
            numeroAgente: numeroAgente || null,
            idClube: idClube || null,
            idEscalao: idEscalao || null,
            avaliacaoFinal: null
        });

        if (links) {
            if (Array.isArray(links)) {
                for (const l of links) {
                    await Links.create({ idAtleta: novoAtleta.id, link: l });
                }
            } else {
                await Links.create({ idAtleta: novoAtleta.id, links });
            }
        }

        return res.status(201).json({
            success: true,
            message: "Atleta criado com sucesso.",
            data: novoAtleta, links
        });
    } catch (error) {
        console.error("[ERRO AO CRIAR ATLETA]:", error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: "Erro de validação - Dados inválidos fornecidos.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Erro inesperado no servidor.",
        });
    }
};

controllers.editarAtleta = async (req, res) => {
    try {
        const id = req.openapi.pathParams.id;
        const { nome, dataNascimento, anoNascimento, nacionalidade, posicao, nomeAgente, numeroAgente, avaliacaoFinal, idClube, idEscalao, links } = req.body;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1 && authedUser.tipoUtilizador !== 2) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem editar escalões.",
            });
        }

        if (!nome || !anoNascimento || !nacionalidade) {
            return res.status(400).json({
                success: false,
                message: "Dados inválidos - Todos os campos obrigatórios devem ser fornecidos.",
            });
        }

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID do Atleta inválido ou ausente.",
            });
        }

        const AtletaAtualizado = await Atletas.update({
            nome,
            dataNascimento: dataNascimento || null,
            anoNascimento,
            nacionalidade,
            posicao: posicao || null,
            nomeAgente: nomeAgente || null,
            numeroAgente: numeroAgente || null,
            idClube,
            idEscalao,
            avaliacaoFinal: avaliacaoFinal || null
        }, { where: { id } });

        if (links) {
            // Buscar todos os links do atleta
            const linksExistentes = await Links.findAll({
                where: { idAtleta: id }
            });
        
            // Converter os links existentes para um array de strings
            const linksAtuais = linksExistentes.map(link => link.link);
        
            // Garantir que `links` é sempre um array
            const novosLinks = Array.isArray(links) ? links.map(l => l.link) : [links];
        
            // Criar os novos links se não existirem
            for (const l of novosLinks) {
                if (!linksAtuais.includes(l)) {
                    await Links.create({ idAtleta: id, link: l });
                }
            }
        
            // Remover os links que não estão no `datapost`
            for (const link of linksExistentes) {
                if (!novosLinks.includes(link.link)) {
                    await Links.destroy({ where: { id: link.id } });
                }
            }
        }        

        return res.status(200).json({
            success: true,
            message: "Atleta atualizado com sucesso.",
            data: AtletaAtualizado,
        });
    } catch (error) {
        console.error("[ERRO AO EDITAR ATLETA]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.listaAtletas = async (req, res) => {
    try {
        const { nome, limit = 10, offset = 0 } = req.query;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem visualizar atletas.",
            });
        }

        if (limit > 100 || limit < 1 || offset < 0) {
            return res.status(400).json({
                success: false,
                message: "Parâmetros de paginação inválidos.",
            });
        }

        const filters = {};
        if (nome) {
            filters.nome = { [Op.like]: `%${nome}%` };
        }

        const totalCount = await Atletas.count({});

        const atletas = await Atletas.findAll({
            where: filters,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['id', 'ASC']],
            include: [
                {
                    model: Links,
                    as: 'links',
                    attributes: ['id', 'link']
                }
            ]
        });

        return res.status(200).json({
            success: true,
            totalCount: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: Math.floor(offset / limit) + 1,
            data: atletas,
        });
    } catch (error) {
        console.error("[ERRO AO LISTAR ATLETAS]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.listartodosatletas = async (req, res) => {
    try {
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem visualizar atletas.",
            });
        }

        const totalCount = await Atletas.count({});

        const atletas = await Atletas.findAll({
            order: [['id', 'ASC']],
            include: [
                {
                    model: Links,
                    as: 'links',
                    attributes: ['id', 'link']
                }
            ]
        });

        return res.status(200).json({
            success: true,
            data: atletas,
        });
    } catch (error) {
        console.error("[ERRO AO LISTAR ATLETAS]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.listaUmAtleta = async (req, res) => {
    try {
        const id = req.openapi.pathParams.id;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem visualizar atletas.",
            });
        }

        const atletas = await Atletas.findOne({
            where: { id: id },
            include: [
                {
                    model: Links,
                    as: 'links',
                    attributes: ['link']
                },
                {
                    model: Clube,
                    as: 'clube',
                    attributes: ['id', 'nome']
                },
                {
                    model: Escalao,
                    as: 'escalao',
                    attributes: ['id', 'nome']
                },
            ]
        });

        if (!atletas) { 
            return res.status(404).json({
                success: false,
                message: `Nenhum atleta encontrado`,
            });
        }

        const avaliacoesMedia = await Relatorios.findOne({
            attributes: [
                [Sequelize.fn('ROUND', Sequelize.fn('AVG', Sequelize.col('tecnica'))), 'mediaTecnica'],
                [Sequelize.fn('ROUND', Sequelize.fn('AVG', Sequelize.col('velocidade'))), 'mediaVelocidade'],
                [Sequelize.fn('ROUND', Sequelize.fn('AVG', Sequelize.col('atitudeCompetitiva'))), 'mediaAtitudeCompetitiva'],
                [Sequelize.fn('ROUND', Sequelize.fn('AVG', Sequelize.col('inteligencia'))), 'mediaInteligencia']
            ],
            where: { idAtleta: id },
            raw: true // para obter um objeto simples
        });

        return res.status(200).json({
            success: true,
            data: atletas,
            mediasHabilidades: avaliacoesMedia
        });
    } catch (error) {
        console.error("[ERRO AO LISTAR ATLETAS]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};


module.exports = controllers;