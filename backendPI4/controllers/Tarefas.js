'use strict';

var Tarefas = require('../models/Tarefa.js');
var Clube = require('../models/Clube.js');
var Utilizador = require('../models/Utilizador.js');
var Atleta = require('../models/Atleta.js');
const { autenticarJWT } = require('../utils/authMiddleware');
const { Op } = require("sequelize");

const controllers = {};

controllers.apagarTarefa = async (req, res) => {
    try {
        const id = req.openapi.pathParams.id;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem criar escalões.",
            });
        }

        const Tarefa = await Tarefas.findOne({ where: { id } });
        if (!Tarefa) {
            return res.status(404).json({
                success: false,
                message: "Tarefa não encontrado.",
            });
        }

        await Tarefas.destroy({ where: { id } });

        return res.status(204).json({
            success: true,
            message: "Tarefa apagado com sucesso.",
        });
    } catch (error) {
        console.error("[ERRO AO APAGAR TAREFA]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.criarTarefa = async (req, res) => {
    try {
        const { data, horaInicio, horaFim, jogaCasa, idAtleta, idClube, idUtilizador } = req.body;
        const authedUser = autenticarJWT(req);

        if (authedUser.tipoUtilizador !== 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores e olheiros podem criar Tarefas.",
            });
        }

        if (!data || !idAtleta || !idUtilizador) {
            return res.status(400).json({
                success: false,
                message: "Dados inválidos - Todos os campos obrigatórios devem ser fornecidos.",
            });
        }

        const utilizador = await Utilizador.findOne({
            where: { id: idUtilizador }
        })

        if (utilizador.tipoUtilizador !== 2) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - O utilizador deve ser olheiro.",
            });
        }

        const novoTarefa = await Tarefas.create({
            data,
            horaInicio,
            horaFim,
            jogaCasa,
            idAtleta,
            idClube,
            idUtilizador,
        });

        return res.status(201).json({
            success: true,
            message: "Tarefa criado com sucesso.",
            data: novoTarefa
        });
    } catch (error) {
        console.error("[ERRO AO CRIAR TAREFA]:", error);

        return res.status(500).json({
            success: false,
            message: "Erro inesperado no servidor.",
        });
    }
};

controllers.editarTarefa = async (req, res) => {
    try {
        const id = req.openapi.pathParams.id;
        const { data, horaInicio, horaFim, jogaCasa, idAtleta, idClube, idUtilizador } = req.body;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem editar escalões.",
            });
        }

        if (!data || !idAtleta || !idUtilizador) {
            return res.status(400).json({
                success: false,
                message: "Dados inválidos - Todos os campos obrigatórios devem ser fornecidos.",
            });
        }

        const TarefaAtualizado = await Tarefas.update({
            data,
            horaInicio,
            horaFim,
            jogaCasa,
            idAtleta,
            idClube,
            idUtilizador,
        }, { where: { id } });

        return res.status(200).json({
            success: true,
            message: "Tarefa atualizado com sucesso.",
            data: TarefaAtualizado,
        });
    } catch (error) {
        console.error("[ERRO AO EDITAR TAREFA]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.listaTarefas = async (req, res) => {
    try {
        const { idUtilizador, idAtleta, limit = 10, offset = 0 } = req.query;
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
        if (idUtilizador) {
            filters.idUtilizador = idUtilizador;
        }
        if (idAtleta) {
            filters.idAtleta = idAtleta;
        }

        const Tarefa = await Tarefas.findAndCountAll({
            where: filters,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['data', 'ASC']],
            include: [
                {
                    model: Clube,
                    as: 'clube',
                    attributes: ['id', 'nome', 'icon']
                },
                {
                    model: Utilizador,
                    as: 'utilizador',
                    attributes: ['id', 'nome']
                },
                {
                    model: Atleta,
                    as: 'atleta',
                    attributes: ['id', 'nome'],
                    include: [
                        {
                            model: Clube,
                            as: 'clube',
                            attributes: ['id', 'nome', 'icon']
                        }
                    ]
                }
            ]
        });

        return res.status(200).json({
            success: true,
            totalCount: Tarefa.count,
            totalPages: Math.ceil(Tarefa.count / limit),
            currentPage: Math.floor(offset / limit) + 1,
            data: Tarefa.rows,
        });
    } catch (error) {
        console.error("[ERRO AO LISTAR TAREFAS]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.listaUmaTarefa = async (req, res) => {
    try {
        const id = req.openapi.pathParams.id;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem visualizar escalões.",
            });
        }

        const Tarefa = await Tarefas.findOne({
            where: { id: id },
            include: [
                {
                    model: Clube,
                    as: 'clube',
                    attributes: ['id', 'nome', 'icon']
                },
                {
                    model: Utilizador,
                    as: 'utilizador',
                    attributes: ['id', 'nome']
                },
                {
                    model: Atleta,
                    as: 'atleta',
                    attributes: ['id', 'nome'],
                    include: [
                        {
                            model: Clube,
                            as: 'clube',
                            attributes: ['id', 'nome', 'icon']
                        }
                    ]
                }
            ]
        });

        if (!Tarefa) {
            return res.status(404).json({
                success: false,
                message: `Nenhuma tarefa encontrada`,
            });
        }

        return res.status(200).json({
            success: true,
            data: Tarefa,
        });
    } catch (error) {
        console.error("[ERRO AO LISTAR TAREFAS]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.listaProximaTarefa = async (req, res) => {
    try {
        const authedUser = autenticarJWT(req);

        if (authedUser.tipoUtilizador !== 1 && authedUser.tipoUtilizador !== 2) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores e olheiros podem visualizar tarefas.",
            });
        }

        const hoje = new Date();

        const Tarefa = await Tarefas.findOne({
            where: {
                idUtilizador: authedUser.id,
                horaInicio: { [Op.gt]: hoje },
            },
            include: [
                {
                    model: Clube,
                    as: 'clube',
                    attributes: ['id', 'nome', 'icon']
                },
                {
                    model: Utilizador,
                    as: 'utilizador',
                    attributes: ['id', 'nome']
                },
                {
                    model: Atleta,
                    as: 'atleta',
                    attributes: ['id', 'nome'],
                    include: [
                        {
                            model: Clube,
                            as: 'clube',
                            attributes: ['id', 'nome', 'icon']
                        }
                    ]
                }
            ],
            order: [['horaInicio', 'ASC']],
            limit: 1,
        });

        if (!Tarefa) {
            return res.status(404).json({
                success: false,
                message: `Nenhuma tarefa encontrada`,
            });
        }

        return res.status(200).json({
            success: true,
            data: Tarefa,
        });
    } catch (error) {
        console.error("[ERRO AO LISTAR TAREFAS]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.listaProximasTarefas = async (req, res) => {
    try {
        const authedUser = autenticarJWT(req);

        if (authedUser.tipoUtilizador !== 1 && authedUser.tipoUtilizador !== 2) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores e olheiros podem visualizar tarefas.",
            });
        }

        const hoje = new Date();

        const Tarefa = await Tarefas.findAll({
            where: {
                idUtilizador: authedUser.id,
                horaInicio: { [Op.gt]: hoje },
            },
            include: [
                {
                    model: Clube,
                    as: 'clube',
                    attributes: ['id', 'nome', 'icon']
                },
                {
                    model: Utilizador,
                    as: 'utilizador',
                    attributes: ['id', 'nome']
                },
                {
                    model: Atleta,
                    as: 'atleta',
                    attributes: ['id', 'nome'],
                    include: [
                        {
                            model: Clube,
                            as: 'clube',
                            attributes: ['id', 'nome', 'icon']
                        }
                    ]
                }
            ],
            order: [['horaInicio', 'ASC']],
        });

        if (!Tarefa) {
            return res.status(404).json({
                success: false,
                message: `Nenhuma tarefa encontrada`,
            });
        }

        return res.status(200).json({
            success: true,
            data: Tarefa,
        });
    } catch (error) {
        console.error("[ERRO AO LISTAR TAREFAS]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

module.exports = controllers;