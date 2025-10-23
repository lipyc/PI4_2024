// services/inicializarEscaloes.js
const Escalao = require('../models/Escalao.js');

async function inicializarEscaloes() {
  try {
    const escalõesExistentes = await Escalao.findAll();

    if (escalõesExistentes.length === 0) {
      console.log('Nenhum escalão encontrado. Criando os escalões...');

      const escalões = [
        { nome: 'Escolinhas', idadeMin: 4, idadeMax: 7 },
        { nome: 'Benjamins', idadeMin: 8, idadeMax: 10 },
        { nome: 'Infantis', idadeMin: 11, idadeMax: 13 },
        { nome: 'Iniciados', idadeMin: 14, idadeMax: 16 },
        { nome: 'Juvenis', idadeMin: 17, idadeMax: 19 },
        { nome: 'Juniores', idadeMin: 20, idadeMax: 22 },
        { nome: 'Seniores', idadeMin: 23, idadeMax: 40 },
      ];

      for (let escalao of escalões) {
        await Escalao.create({
          nome: escalao.nome,
          idadeMin: escalao.idadeMin,
          idadeMax: escalao.idadeMax,
        });
        console.log(`Escalão "${escalao.nome}" criado com sucesso!`);
      }
    } else {
      console.log('Os escalões já estão inicializados.');
    }
  } catch (error) {
    console.error('Erro ao inicializar os escalões:', error);
  }
}

module.exports = inicializarEscaloes;
