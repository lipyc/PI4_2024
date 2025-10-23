'use strict';

var Equipas = require('../models/Equipa.js');
var Posicao = require('../models/Posicao.js');
var Atleta = require('../models/Atleta.js');
const { Op } = require('sequelize');
const { autenticarJWT } = require('../utils/authMiddleware');

const controllers = {};

controllers.apagarEquipa = async (req, res) => {
    try {
        const id = req.openapi.pathParams.id;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem criar escalões.",
            });
        }

        const Equipa = await Equipas.findOne({ where: { id } });
        if (!Equipa) {
            return res.status(404).json({
                success: false,
                message: "Equipa não encontrado.",
            });
        }

        await Equipas.destroy({ where: { id } });

        return res.status(204).json({
            success: true,
            message: "Equipa apagado com sucesso.",
        });
    } catch (error) {
        console.error("[ERRO AO APAGAR EQUIPA]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.criarEquipa = async (req, res) => {
    try {
        const { posicoes, nome, ePropria } = req.body;
        const authedUser = autenticarJWT(req);

        if (authedUser.tipoUtilizador !== 1 && authedUser.tipoUtilizador !== 3) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores e outros podem criar Equipas.",
            });
        }

        if (!nome) {
            return res.status(400).json({
                success: false,
                message: "Dados inválidos - Todos os campos obrigatórios devem ser fornecidos.",
            });
        }

        const novoEquipa = await Equipas.create({
            nome, ePropria
        });

        if (posicoes) {
            if (Array.isArray(posicoes)) {
                for (const posicao of posicoes) {
                    await Posicao.create({
                        idEquipa: novoEquipa.id,
                        numero: posicao.numero,
                        idAtleta: posicao.idAtleta
                    });
                }
            } else {
                await Posicao.create({
                    idEquipa: novoEquipa.id,
                    numero: posicoes.numero,
                    idAtleta: posicoes.idAtleta
                });
            }
        }

        return res.status(201).json({
            success: true,
            message: "Equipa criado com sucesso.",
            data: novoEquipa
        });
    } catch (error) {
        console.error("[ERRO AO CRIAR EQUIPA]:", error);

        return res.status(500).json({
            success: false,
            message: "Erro inesperado no servidor.",
        });
    }
};

controllers.editarEquipa = async (req, res) => {
    try {
        const id = req.openapi.pathParams.id;
        const { posicoes, nome, ePropria } = req.body;
        const authedUser = autenticarJWT(req);

        if (authedUser.tipoUtilizador !== 1 && authedUser.tipoUtilizador !== 3) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem editar escalões.",
            });
        }

        if (!nome || ePropria == null) {
            return res.status(400).json({
                success: false,
                message: "Dados inválidos - Todos os campos obrigatórios devem ser fornecidos.",
            });
        }

        await Equipas.update({ nome, ePropria }, { where: { id } });

        if (Array.isArray(posicoes)) {
            for (const posicao of posicoes) {
                await Posicao.update(
                    {
                        numero: posicao.numero,
                        idAtleta: posicao.idAtleta
                    },
                    { where: { numero: posicao.numero, idEquipa: id } } // Garante que atualiza apenas dentro da equipa correta
                );
            }
        }        

        return res.status(200).json({
            success: true,
            message: "Equipa editada com sucesso."
        });
    } catch (error) {
        console.error("[ERRO AO EDITAR EQUIPA]:", error);

        return res.status(500).json({
            success: false,
            message: "Erro inesperado no servidor.",
        });
    }
};

controllers.listaEquipas = async (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        const authedUser = autenticarJWT(req);

        if (authedUser.tipoUtilizador !== 1 && authedUser.tipoUtilizador !== 3) {
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

        const totalCount = await Equipas.count({});

        const equipas = await Equipas.findAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['id', 'ASC']],
        });

        const equipasComJogadores = await Promise.all(equipas.map(async (equipe) => {
            const jogadoresCount = await Posicao.count({
                where: {
                    idEquipa: equipe.id,  // Filtra pela equipa atual
                    idAtleta: {
                        [Op.ne]: null,  // Filtra jogadores onde idAtleta não é null
                    },
                },
            });

            // Retorna a equipa com a contagem de jogadores
            return {
                ...equipe.toJSON(),
                jogadoresCount,
            };
        }));

        return res.status(200).json({
            success: true,
            totalCount: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: Math.floor(offset / limit) + 1,
            data: equipasComJogadores,
        });
    } catch (error) {
        console.error("[ERRO AO LISTAR EQUIPAS]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.listaUmaEquipa = async (req, res) => {
    try {
        const id = req.openapi.pathParams.id;
        const authedUser = autenticarJWT(req);

        if (authedUser.tipoUtilizador !== 1 && authedUser.tipoUtilizador !== 3) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem visualizar equipas.",
            });
        }

        const equipas = await Equipas.findOne({
            where: { id: id },
            include: [
                {
                    model: Posicao,
                    as: 'posicoes',
                    include: [
                        {
                            model: Atleta,
                            as: 'atleta',
                            attributes: ['id', 'nome']
                        }
                    ]
                }
            ],
            order: [['id', 'ASC']],
        });
        
        if (!equipas || equipas.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Nenhuma equipa encontrada.`,
            });
        }

        return res.status(200).json({
            success: true,
            data: equipas,
        });
    } catch (error) {
        console.error("[ERRO AO LISTAR EQUIPAS]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};


module.exports = controllers;