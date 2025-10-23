'use strict';

var Escaloes = require('../models/Escalao.js');
const { autenticarJWT } = require('../utils/authMiddleware');
const { Op } = require('sequelize');

const controllers = {};

controllers.apagarEscalao = async (req, res) => {
    try {
        const id = req.openapi.pathParams.id;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem criar escalões.",
            });
        }

        const escalao = await Escaloes.findOne({ where: { id } });
        if (!escalao) {
            return res.status(404).json({
                success: false,
                message: "Escalão não encontrado.",
            });
        }

        await Escaloes.destroy({ where: { id } });

        return res.status(204).json({
            success: true,
            message: "Escalão apagado com sucesso.",
        });
    } catch (error) {
        console.error("[ERRO AO APAGAR ESCALÃO]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.criarEscalao = async (req, res) => {
    try {
        const { nome, idadeMax, idadeMin } = req.body;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem criar escalões.",
            });
        }

        if (!nome || !idadeMax || !idadeMin) {
            return res.status(400).json({
                success: false,
                message: "Dados inválidos - Todos os campos obrigatórios devem ser fornecidos.",
            });
        }

        if (nome.length < 3) {
            return res.status(400).json({
                success: false,
                message: "O nome do escalão deve ter pelo menos 3 caracteres.",
            });
        }

        if (idadeMax < idadeMin) {
            return res.status(400).json({
                success: false,
                message: "A idade máxima não pode ser menor que a idade mínima.",
            });
        }

        const escalaoExistente = await Escaloes.findOne({ where: { nome } });
        if (escalaoExistente) {
            return res.status(409).json({
                success: false,
                message: "Já existe um escalão com este nome.",
            });
        }

        const novoEscalao = await Escaloes.create({ nome, idadeMax, idadeMin });

        return res.status(201).json({
            success: true,
            message: "Escalão criado com sucesso.",
            data: novoEscalao,
        });
    } catch (error) {
        console.error("[ERRO AO CRIAR ESCALÃO]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.editarEscalao = async (req, res) => {
    try {
        const id = req.openapi.pathParams.id;
        const { nome, idadeMax, idadeMin } = req.body;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem editar escalões.",
            });
        }

        if (!nome || !idadeMax || !idadeMin) {
            return res.status(400).json({
                success: false,
                message: "Dados inválidos - Todos os campos obrigatórios devem ser fornecidos.",
            });
        }

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID do escalão inválido ou ausente.",
            });
        }

        const escalao = await Escaloes.findOne({ where: { id } });
        if (!escalao) {
            return res.status(404).json({
                success: false,
                message: "Escalão não encontrado.",
            });
        }

        if (nome && nome.length < 3) {
            return res.status(400).json({
                success: false,
                message: "O nome do escalão deve ter pelo menos 3 caracteres.",
            });
        }

        if (idadeMax < idadeMin) {
            return res.status(400).json({
                success: false,
                message: "A idade máxima não pode ser menor que a idade mínima.",
            });
        }

        await Escaloes.update({ nome, idadeMax, idadeMin }, { where: { id } });

        const escalaoAtualizado = await Escaloes.findOne({ where: { id } });

        return res.status(200).json({
            success: true,
            message: "Escalão atualizado com sucesso.",
            data: escalaoAtualizado,
        });
    } catch (error) {
        console.error("[ERRO AO EDITAR ESCALÃO]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.listaEscaloes = async (req, res) => {
    try {
        const { nome, limit = 10, offset = 0 } = req.query;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem visualizar escalões.",
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

        const escaloes = await Escaloes.findAndCountAll({
            where: filters,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['id', 'ASC']],
        });

        return res.status(200).json({
            success: true,
            totalCount: escaloes.count,
            totalPages: Math.ceil(escaloes.count / limit),
            currentPage: Math.floor(offset / limit) + 1,
            data: escaloes.rows,
        });
    } catch (error) {
        console.error("[ERRO AO LISTAR ESCALÕES]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

module.exports = controllers;