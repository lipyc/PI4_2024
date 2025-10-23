'use strict';

var Clube = require('../models/Clube.js');
const { autenticarJWT } = require('../utils/authMiddleware');
const { Op } = require('sequelize');
const controllers = {};

controllers.apagarClube = async (req, res) => {
    try {
        const id = req. openapi.pathParams.id;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem criar clubes.",
            });
        }

        const clube = await Clube.findOne({ where: { id } });
        if (!clube) {
            return res.status(404).json({
                success: false,
                message: "Clube não encontrado.",
            });
        }

        await Clube.destroy({ where: { id } });

        return res.status(204).json({
            success: true,
            message: "Clube apagado com sucesso.",
        });
    } catch (error) {
        console.error("[ERRO AO APAGAR CLUBE]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.criarClube = async (req, res) => {
    try {
        const { nome, icon } = req.body;

        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem criar clubes.",
            });
        }

        if (!nome) {
            return res.status(400).json({
              success: false,
              message: "Dados inválidos - Todos os campos obrigatórios devem ser fornecidos.",
            });
          }

          if (!icon) {
            return res.status(400).json({
                success: false,
                message: "Erro: ícone do clube é obrigatório.",
            });
        }
        

        if (nome.length < 3) {
            return res.status(400).json({
                success: false,
                message: "O nome do clube deve ter pelo menos 3 caracteres.",
            });
        }

        const clubeExistente = await Clube.findOne({ where: { nome } });
        if (clubeExistente) {
            return res.status(409).json({
                success: false,
                message: "Já existe um clube com este nome.",
            });
        }

        const novoClube = await Clube.create({ nome, icon });

        return res.status(201).json({
            success: true,
            message: "Clube criado com sucesso.",
            data: novoClube,
        });
    } catch (error) {
        console.error("[ERRO AO CRIAR CLUBE]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.listaClubes = async (req, res) => {
    try {
        const { nome, limit = 10, offset = 0 } = req.query;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem criar clubes.",
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

        const clubes = await Clube.findAndCountAll({
            where: filters,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['id', 'ASC']],
        });

        return res.status(200).json({
            success: true,
            totalCount: clubes.count,
            totalPages: Math.ceil(clubes.count / limit),
            currentPage: Math.floor(offset / limit) + 1,
            data: clubes.rows,
        });
    } catch (error) {
        console.error("[ERRO AO LISTAR CLUBES]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

module.exports = controllers;