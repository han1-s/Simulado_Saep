const pool = require("../config/database");

async function buscarUsuario(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Usuário inválido."
      });
    }

    const [usuarios] = await pool.execute(
      `
      SELECT
        u.id,
        u.nome,
        u.email,
        u.foto,
        COUNT(DISTINCT a.id) AS total_atividades,
        COALESCE(SUM(a.calorias), 0) AS total_calorias
      FROM usuarios u
      LEFT JOIN atividades a ON a.usuario_id = u.id
      WHERE u.id = ?
      GROUP BY u.id, u.nome, u.email, u.foto
      `,
      [id]
    );

    if (!usuarios.length) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado."
      });
    }

    return res.json({
      success: true,
      data: usuarios[0]
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar usuário."
    });
  }
}

module.exports = { buscarUsuario };
