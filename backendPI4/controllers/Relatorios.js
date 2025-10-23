'use strict';

var Relatorios = require('../models/Relatorio.js');
var Atleta = require('../models/Atleta.js');
const { autenticarJWT } = require('../utils/authMiddleware');

const controllers = {};

controllers.apagarRelatorio = async (req, res) => {
    try {
        const id = req.openapi.pathParams.id;
        const authedUser = autenticarJWT(req);

        if (!authedUser.tipoUtilizador == 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem criar escalões.",
            });
        }

        const Relatorio = await Relatorios.findOne({ where: { id } });
        if (!Relatorio) {
            return res.status(404).json({
                success: false,
                message: "Relatorio não encontrado.",
            });
        }

        await Relatorios.destroy({ where: { id } });

        return res.status(204).json({
            success: true,
            message: "Relatorio apagado com sucesso.",
        });
    } catch (error) {
        console.error("[ERRO AO APAGAR RELATORIO]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.criarRelatorio = async (req, res) => {
    try {
        const { tecnica, velocidade, atitudeCompetitiva, inteligencia, altura, morfologia, idAtleta } = req.body;
        const authedUser = autenticarJWT(req);

        if (authedUser.tipoUtilizador !== 1 && authedUser.tipoUtilizador !== 2) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores e olheiros podem criar Relatorios.",
            });
        }

        if (
            tecnica === null || tecnica === undefined ||
            velocidade === null || velocidade === undefined ||
            atitudeCompetitiva === null || atitudeCompetitiva === undefined ||
            inteligencia === null || inteligencia === undefined ||
            altura === null || altura === undefined ||
            morfologia === null || morfologia === undefined ||
            idAtleta === null || idAtleta === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Dados inválidos - Todos os campos obrigatórios devem ser fornecidos.",
            });
        }

        const dataAtual = new Date();
        const avaliacaoFinal = Math.round((tecnica + velocidade + atitudeCompetitiva + inteligencia) / 4);

        const novoRelatorio = await Relatorios.create({
            tecnica,
            velocidade,
            atitudeCompetitiva,
            inteligencia,
            altura,
            morfologia,
            data: dataAtual,
            avaliacaoFinal,
            idAtleta
        });

        return res.status(201).json({
            success: true,
            message: "Relatorio criado com sucesso.",
            data: novoRelatorio
        });
    } catch (error) {
        console.error("[ERRO AO CRIAR RELATORIO]:", error);

        return res.status(500).json({
            success: false,
            message: "Erro inesperado no servidor.",
        });
    }
};

controllers.listaRelatorios = async (req, res) => {
    try {
        const { avaliacaoFinal, atletaId, data, limit = 10, offset = 0 } = req.query;
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
        if (avaliacaoFinal) {
            filters.avaliacaoFinal = avaliacaoFinal;
        }
        if (atletaId) {
            filters.atletaId = atletaId;
        }
        if (data) {
            filters.data = data;
        }

        const Relatorio = await Relatorios.findAndCountAll({
            where: filters,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['data', 'ASC']],
            include: [
                {
                    model: Atleta,
                    as: 'atleta',
                    attributes: ['id', 'nome'],
                }
            ]
        });

        return res.status(200).json({
            success: true,
            totalCount: Relatorio.count,
            totalPages: Math.ceil(Relatorio.count / limit),
            currentPage: Math.floor(offset / limit) + 1,
            data: Relatorio.rows,
        });
    } catch (error) {
        console.error("[ERRO AO LISTAR RELATORIOS]:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

controllers.listaRelatoriosPorAtleta = async (req, res) => {
    try {
        // Autenticar o usuário com o token JWT
        const authedUser = autenticarJWT(req);

        // Verificar se o usuário é um administrador (tipoUtilizador == 1)
        if (authedUser.tipoUtilizador !== 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem acessar os relatórios.",
            });
        }

        // Acessar o parâmetro 'idAtleta' da URL (usando OpenAPI)
        const idAtleta = req.openapi.pathParams.idAtleta;  // Para OpenAPI/Swagger

        if (!idAtleta) {
            return res.status(400).json({
                success: false,
                message: "O parâmetro 'idAtleta' é obrigatório.",
            });
        }

        // Buscar relatórios do atleta com idAtleta especificado
        const relatorios = await Relatorios.findAll({ where: { idAtleta } }); // Alterei aqui, de Relatorios para relatorios
        if (relatorios.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Nenhum relatório encontrado para este atleta.",
            });
        }

        return res.status(200).json({
            success: true,
            data: relatorios,
        });

    } catch (error) {
        console.error("Erro ao buscar relatórios:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno do servidor.",
        });
    }
};

module.exports = controllers;