const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: "email ou senha obrigatório"
      });
    }

    const [usuarios] = await pool.execute(
      "SELECT id, nome, email, senha, foto FROM usuarios WHERE email = ? LIMIT 1",
      [email.trim().toLowerCase()]
    );

    if (!usuarios.length) {
      return res.status(401).json({
        success: false,
        message: "email ou senha incorreta"
      });
    }

    const usuario = usuarios[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: "email ou senha incorreta"
      });
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    delete usuario.senha;

    return res.json({
      success: true,
      data: {
        token,
        usuario
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao realizar login."
    });
  }
}

async function logout(req, res) {
  return res.json({
    success: true,
    message: "Logout realizado com sucesso."
  });
}

module.exports = { login, logout };
