const pool = require("../config/database");

async function statusCurtida(req, res) {
  try {
    const atividadeId = Number(req.params.id);

    const [rows] = await pool.execute(
      "SELECT id FROM curtidas WHERE atividade_id = ? AND usuario_id = ? LIMIT 1",
      [atividadeId, req.usuario.id]
    );

    return res.json({
      success: true,
      data: {
        curtiu: rows.length > 0
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro ao consultar curtida."
    });
  }
}

async function adicionarCurtida(req, res) {
  const conexao = await pool.getConnection();

  try {
    const atividadeId = Number(req.params.id);

    if (!Number.isInteger(atividadeId) || atividadeId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Atividade inválida."
      });
    }

    await conexao.beginTransaction();

    const [atividade] = await conexao.execute(
      "SELECT id FROM atividades WHERE id = ? LIMIT 1",
      [atividadeId]
    );

    if (!atividade.length) {
      await conexao.rollback();
      return res.status(404).json({
        success: false,
        message: "Atividade não encontrada."
      });
    }

    await conexao.execute(
      "INSERT IGNORE INTO curtidas (atividade_id, usuario_id) VALUES (?, ?)",
      [atividadeId, req.usuario.id]
    );

    const [contagem] = await conexao.execute(
      "SELECT COUNT(*) AS total FROM curtidas WHERE atividade_id = ?",
      [atividadeId]
    );

    await conexao.commit();

    return res.json({
      success: true,
      data: {
        curtiu: true,
        total_likes: Number(contagem[0].total)
      }
    });
  } catch (error) {
    await conexao.rollback();
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro ao adicionar curtida."
    });
  } finally {
    conexao.release();
  }
}

async function removerCurtida(req, res) {
  const conexao = await pool.getConnection();

  try {
    const atividadeId = Number(req.params.id);

    await conexao.beginTransaction();

    await conexao.execute(
      "DELETE FROM curtidas WHERE atividade_id = ? AND usuario_id = ?",
      [atividadeId, req.usuario.id]
    );

    const [contagem] = await conexao.execute(
      "SELECT COUNT(*) AS total FROM curtidas WHERE atividade_id = ?",
      [atividadeId]
    );

    await conexao.commit();

    return res.json({
      success: true,
      data: {
        curtiu: false,
        total_likes: Number(contagem[0].total)
      }
    });
  } catch (error) {
    await conexao.rollback();
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro ao remover curtida."
    });
  } finally {
    conexao.release();
  }
}

module.exports = {
  statusCurtida,
  adicionarCurtida,
  removerCurtida
};
