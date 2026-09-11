const pool = require("../config/database");

async function listarComentarios(req, res) {
  try {
    const atividadeId = Number(req.params.id);

    const [comentarios] = await pool.execute(
      `
      SELECT
        c.id,
        c.texto,
        c.criado_em,
        u.id AS usuario_id,
        u.nome AS usuario_nome,
        u.foto AS usuario_foto
      FROM comentarios c
      INNER JOIN usuarios u ON u.id = c.usuario_id
      WHERE c.atividade_id = ?
      ORDER BY c.criado_em ASC, c.id ASC
      `,
      [atividadeId]
    );

    return res.json({
      success: true,
      data: comentarios
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro ao listar comentários."
    });
  }
}

async function criarComentario(req, res) {
  try {
    const atividadeId = Number(req.params.id);
    const texto = typeof req.body.texto === "string" ? req.body.texto.trim() : "";

    if (texto.length <= 2) {
      return res.status(400).json({
        success: false,
        message: "não é possível enviar um comentário vazio"
      });
    }

    const [atividade] = await pool.execute(
      "SELECT id FROM atividades WHERE id = ? LIMIT 1",
      [atividadeId]
    );

    if (!atividade.length) {
      return res.status(404).json({
        success: false,
        message: "Atividade não encontrada."
      });
    }

    const [resultado] = await pool.execute(
      `
      INSERT INTO comentarios (atividade_id, usuario_id, texto)
      VALUES (?, ?, ?)
      `,
      [atividadeId, req.usuario.id, texto]
    );

    const [comentarios] = await pool.execute(
      `
      SELECT
        c.id,
        c.texto,
        c.criado_em,
        u.id AS usuario_id,
        u.nome AS usuario_nome,
        u.foto AS usuario_foto
      FROM comentarios c
      INNER JOIN usuarios u ON u.id = c.usuario_id
      WHERE c.id = ?
      `,
      [resultado.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Comentário enviado com sucesso.",
      data: comentarios[0]
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro ao criar comentário."
    });
  }
}

module.exports = {
  listarComentarios,
  criarComentario
};
