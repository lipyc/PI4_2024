'use strict';

var Utilizadores = require('../models/Utilizador.js');
const { autenticarJWT } = require('../utils/authMiddleware');
const { Op } = require('sequelize');

const controllers = {}

controllers.apagarUtilizador = async (req, res) => {
    try {
        const authedUser = autenticarJWT(req);
        const id = req.openapi.pathParams.id;

        if (!authedUser) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Token de autenticação inválido ou ausente.",
            });
        }

        const utilizador = await Utilizadores.findOne({ where: { id } });
        if (!utilizador) {
            return res.status(404).json({
                success: false,
                message: "Utilizador não encontrada.",
            });
        }

        await Utilizadores.destroy({ where: { id } });

        return res.status(204).json({
            success: true,
            message: "Utilizador apagada com sucesso.",
        });
    } catch (error) {
        console.error("[ERRO AO APAGAR RESERVA]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.editarUtilizador = async (req, res) => {
    try {
        const authedUser = autenticarJWT(req);
        const id = req.openapi.pathParams.id;
        const { nome, email, tipoUtilizador } = req.body;

        if (!authedUser) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Token de autenticação inválido ou ausente.",
            });
        }

        if (!nome || !email) {
            return res.status(400).json({
                success: false,
                message: "Dados inválidos - Todos os campos obrigatórios devem ser fornecidos.",
            });
        }

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID do utilizador inválido ou ausente.",
            });
        }

        const utilizador = await Utilizadores.findOne({ where: { id } });
        if (!utilizador) {
            return res.status(404).json({
                success: false,
                message: "Utilizador não encontrado.",
            });
        }

        if (nome && (nome.length < 3 || nome.length > 30)) {
            return res.status(400).json({
                success: false,
                message: "O campo 'nome' deve ter entre 3 e 30 caracteres.",
            });
        }

        if (email && !/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Formato de email inválido.",
            });
        }

        const updatedUtilizador = await Utilizadores.update(
            { nome, email, tipoUtilizador },
            { where: { id } }
        );

        if (updatedUtilizador[0] === 0) {
            return res.status(400).json({
                success: false,
                message: "Nenhuma alteração foi realizada.",
            });
        }

        const utilizadorAtualizado = await Utilizadores.findOne({
            where: { id },
            attributes: { exclude: ['password'] },
        });

        return res.status(200).json({
            success: true,
            message: "Utilizador atualizado com sucesso.",
            data: utilizadorAtualizado,
        });

    } catch (error) {
        console.error("[ERRO AO EDITAR UTILIZADOR]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.editarUtilizadorLogado = async (req, res) => {
    try {
        const authedUser = autenticarJWT(req);
        const { nome, email } = req.body;

        if (!authedUser) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Token de autenticação inválido ou ausente.",
            });
        }

        if (!nome || !email) {
            return res.status(400).json({
                success: false,
                message: "Dados inválidos - Todos os campos obrigatórios devem ser fornecidos.",
            });
        }

        const utilizador = await Utilizadores.findOne({ where: { id: authedUser.id } });
        if (!utilizador) {
            return res.status(404).json({
                success: false,
                message: "Utilizador não encontrado.",
            });
        }

        if (nome && (nome.length < 3 || nome.length > 30)) {
            return res.status(400).json({
                success: false,
                message: "O campo 'nome' deve ter entre 3 e 30 caracteres.",
            });
        }

        if (email && !/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Formato de email inválido.",
            });
        }

        const updatedUtilizador = await Utilizadores.update(
            { nome, email },
            { where: { id: authedUser.id} }
        );

        if (updatedUtilizador[0] === 0) {
            return res.status(400).json({
                success: false,
                message: "Nenhuma alteração foi realizada.",
            });
        }

        const utilizadorAtualizado = await Utilizadores.findOne({
            where: { id: authedUser.id },
            attributes: { exclude: ['password'] },
        });

        return res.status(200).json({
            success: true,
            message: "Utilizador atualizado com sucesso.",
            data: utilizadorAtualizado,
        });

    } catch (error) {
        console.error("[ERRO AO EDITAR UTILIZADOR]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.listaUtilizadores = async (req, res) => {
    try {
        const authedUser = autenticarJWT(req);
        const { nome, tipoUtilizador, limit = 10, offset = 0 } = req.query;

        if (limit > 100 || limit < 1 || offset < 0) {
            return res.status(400).json({
                success: false,
                message: "Parâmetros de paginação inválidos."
            });
        }

        if (!authedUser) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Token de autenticação inválido ou ausente.",
            });
        }

        const filters = {};
        if (nome) {
            filters.nome = { [Op.like]: `%${nome}%` };
        }
        if (tipoUtilizador) {
            filters.tipoUtilizador = tipoUtilizador;
        }

        const utilizadors = await Utilizadores.findAndCountAll({
            where: filters,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['id', 'ASC']],
            attributes: { exclude: ['password'] },
        });

        return res.status(200).json({
            success: true,
            totalCount: utilizadors.count,
            totalPages: Math.ceil(utilizadors.count / limit),
            currentPage: Math.floor(offset / limit) + 1,
            data: utilizadors.rows,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor."
        });
    }
};

controllers.listaUmUtilizador = async (req, res) => {
    try {
        const id = req.openapi.pathParams.id;
        const authedUser = autenticarJWT(req);

        if (!authedUser) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Token de autenticação inválido ou ausente.",
            });
        }

        const utilizadors = await Utilizadores.findOne({
            where: { id: id },
            attributes: { exclude: ['password'] },
        });

        if (!utilizadors) {
            return res.status(404).json({
                success: false,
                message: `Nenhum utilizador encontrado`,
            });
        }

        return res.status(200).json({
            success: true,
            data: utilizadors,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor."
        });
    }
};

controllers.listaUmUtilizadorLogado = async (req, res) => {
    try {
        const authedUser = autenticarJWT(req);

        if (!authedUser) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Token de autenticação inválido ou ausente.",
            });
        }

        const utilizadors = await Utilizadores.findOne({
            where: { id: authedUser.id },
            attributes: { exclude: ['password'] },
        });

        if (!utilizadors) {
            return res.status(404).json({
                success: false,
                message: `Nenhum utilizador encontrado`,
            });
        }

        return res.status(200).json({
            success: true,
            data: utilizadors,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor."
        });
    }
};

controllers.listaOlheiros = async (req, res) => {
    try {
        const authedUser = autenticarJWT(req);

        if (!authedUser) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Token de autenticação inválido ou ausente.",
            });
        }

        const utilizadors = await Utilizadores.findAll({
            where: { tipoUtilizador: 2 },
            attributes: { exclude: ['password', 'email', 'tipoUtilizador'] },
        });

        if (!utilizadors) {
            return res.status(404).json({
                success: false,
                message: `Nenhum utilizador encontrado`,
            });
        }

        return res.status(200).json({
            success: true,
            data: utilizadors,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor."
        });
    }
};

module.exports = controllers;
