const Utilizador = require('../models/Utilizador.js'); 
const bcrypt = require('bcrypt');

async function inicializarAdmin() {
  try {
    const adminExistente = await Utilizador.findOne({ where: { tipoUtilizador: 1 } });

    if (!adminExistente) {
      console.log('Nenhum admin encontrado. Criando o primeiro admin...');

      const passwordEncriptada = await bcrypt.hash('admin123', 10); 

      await Utilizador.create({
        nome: 'Admin',
        email: 'admin@app.com',
        password: passwordEncriptada,
        tipoUtilizador: 1, 
      });

      console.log('Admin criado com sucesso!');
    } else {
      console.log('Já existe um admin no sistema.');
    }
  } catch (error) {
    console.error('Erro ao inicializar o admin:', error);
  }
}

module.exports = inicializarAdmin;
