const jwt = require("jsonwebtoken");

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Usuário não autenticado."
    });
  }

  const token = cabecalho.substring(7);

  try {
    const usuario = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = usuario;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Sessão inválida ou expirada."
    });
  }
}

module.exports = autenticar;
