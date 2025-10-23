'use strict';

var Utilizador = require('../models/Utilizador.js');
//var Autenticao = require('../service/AutenticaoService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

const controllers = {};

controllers.loginNormal = async (req, res) => {
  try {
    const { nome, password } = req.body;

    if (!nome || !password) {
      return res.status(400).json({
        success: false,
        message: "Campos obrigatórios ausentes.",
      });
    }

    const utilizador = await Utilizador.findOne({ where: { nome } });

    if (!utilizador) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas.",
      });
    }

    const match = await bcrypt.compare(password, utilizador.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas.",
      });
    }

    const token = jwt.sign(
      { id: utilizador.id, nome: utilizador.nome, tipoUtilizador: utilizador.tipoUtilizador },
      SECRET_KEY,
      { expiresIn: "8h" }
    );

    return res.status(201).json({
      success: true,
      token,
      nome: nome,
      tipoUtilizador: utilizador.tipoUtilizador,
      id: parseInt(utilizador.id)
    });
  } catch (error) {
    console.error("[ERRO AO LOGAR UTILIZADOR]:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
    });
  }
};

controllers.registerNormal = async (req, res) => {
  try {
    const { nome, email, password } = req.body;

    if (!nome || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos - Todos os campos obrigatórios devem ser fornecidos.",
      });
    }

    const nomeRegex = /^[a-zA-ZÀ-ÿ0-9_ ]{3,20}$/;
    if (!nomeRegex.test(nome)) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos - O nome de utilizador deve ter entre 3 e 20 caracteres e conter apenas letras, números e underscores.",
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos - O email fornecido não é válido.",
      });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos - A palavra-passe deve ter pelo menos 8 caracteres, incluindo letras e números.",
      });
    }

    const utilizadorExistente = await Utilizador.findOne({
      $or: [{ nome }, { email }],
    });
    if (!utilizadorExistente) {
      return res.status(409).json({
        success: false,
        message: "Conflito - O nome de utilizador ou email já está em uso.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const novoUtilizador = await Utilizador.create({
      nome,
      email,
      password: passwordHash,
      tipoUtilizador: 4,
    });

    return res.status(201).json({
      success: true,
      message: "Registo bem-sucedido.",
      data: {
        id: novoUtilizador._id,
        nome: novoUtilizador.nome,
        email: novoUtilizador.email,
      },
    });
  } catch (error) {
    console.error("[ERRO AO CRIAR UTILIZADOR]:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
    });
  }
};

module.exports = controllers;