'use strict';
const fs = require('fs');
const path = require('path');
const { autenticarJWT } = require('../utils/authMiddleware.js');
const baseUrl = process.env.URL

const controllers = {};

controllers.upload = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum ficheiro foi enviado'
            });
        }

        const file = req.files[0];
        const uploadDir = path.join(__dirname, '../uploads');
        let uploadPath = path.join(uploadDir, file.originalname);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        if (fs.existsSync(uploadPath)) {
            const ext = path.extname(file.originalname);
            const baseName = path.basename(file.originalname, ext);
            const timestamp = Date.now();
            uploadPath = path.join(uploadDir, `${baseName}_${timestamp}${ext}`);
        }

        fs.writeFileSync(uploadPath, file.buffer);

        const authedUser = autenticarJWT(req);

        if (!authedUser || authedUser.tipoUtilizador !== 1) {
            return res.status(401).json({
                success: false,
                message: "Não autorizado - Apenas administradores podem criar clubes.",
            });
        }

        res.json({
            success: true,
            url: `${baseUrl}uploads/${path.basename(uploadPath)}`
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor: ' + error.message
        });
    }
};

controllers.buscarImagem = async (req, res) => {
    const authedUser = autenticarJWT(req);

    if (!authedUser) {
        return res.status(401).json({
            success: false,
            message: "Não autorizado - Apenas administradores podem criar clubes.",
        });
    }

    const filename = req.openapi.pathParams.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).json({
                success: false,
                message: 'Ficheiro não encontrado.'
            });
        }
    });
};

module.exports = controllers;
