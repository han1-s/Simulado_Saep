const pool = require("../config/database");

async function buscarEmpresa(req, res) {
  try {
    const [empresas] = await pool.execute(`
      SELECT
        e.id,
        e.nome,
        e.logo,
        COUNT(a.id) AS total_atividades,
        COALESCE(SUM(a.calorias), 0) AS total_calorias
      FROM empresa e
      LEFT JOIN atividades a ON 1 = 1
      GROUP BY e.id, e.nome, e.logo
      LIMIT 1
    `);

    if (!empresas.length) {
      return res.status(404).json({
        success: false,
        message: "Empresa não encontrada."
      });
    }

    return res.json({
      success: true,
      data: empresas[0]
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar dados da empresa."
    });
  }
}

module.exports = { buscarEmpresa };
