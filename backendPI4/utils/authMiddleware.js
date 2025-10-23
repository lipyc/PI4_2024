const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware para autenticação
const autenticarJWT = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token não fornecido.",
    });
  }

  const tokenStripped = token.split(' ')[1];

  try {
    const user = jwt.verify(tokenStripped, SECRET_KEY);

    return user;

  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.status(401).json({
      success: false,
      message: "Token inválido ou expirado.",
    });
  }
};

module.exports = { autenticarJWT };
