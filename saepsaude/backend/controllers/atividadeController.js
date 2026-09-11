const pool = require("../config/database");

const TIPOS = ["corrida", "caminhada", "trilha"];

async function listarAtividades(req, res) {
  try {
    const tipo = req.query.tipo ? String(req.query.tipo).toLowerCase() : "";
    const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit || "4", 10), 1), 50);

    if (tipo && !TIPOS.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de atividade inválido."
      });
    }

    const offset = (page - 1) * limit;
    const filtros = [];
    const parametros = [];

    if (tipo) {
      filtros.push("a.tipo = ?");
      parametros.push(tipo);
    }

    const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

    const [totalRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM atividades a ${where}`,
      parametros
    );

    const total = Number(totalRows[0].total);
    const totalPaginas = Math.max(Math.ceil(total / limit), 1);

    const paginaAtual = Math.min(page, totalPaginas);
    const offsetReal = (paginaAtual - 1) * limit;

    const [atividades] = await pool.execute(
      `
      SELECT
        a.id,
        a.tipo,
        a.distancia_metros,
        a.duracao_minutos,
        a.calorias,
        a.criado_em,
        u.id AS usuario_id,
        u.nome AS usuario_nome,
        u.foto AS usuario_foto,
        COUNT(DISTINCT c.id) AS total_comentarios,
        COUNT(DISTINCT l.id) AS total_likes,
        CASE WHEN EXISTS (
          SELECT 1
          FROM curtidas lc
          WHERE lc.atividade_id = a.id AND lc.usuario_id = ?
        ) THEN 1 ELSE 0 END AS usuario_curtiu
      FROM atividades a
      INNER JOIN usuarios u ON u.id = a.usuario_id
      LEFT JOIN curtidas l ON l.atividade_id = a.id
      LEFT JOIN comentarios c ON c.atividade_id = a.id
      ${where}
      GROUP BY
        a.id,
        a.tipo,
        a.distancia_metros,
        a.duracao_minutos,
        a.calorias,
        a.criado_em,
        u.id,
        u.nome,
        u.foto
      ORDER BY a.criado_em DESC, a.id DESC
      LIMIT ? OFFSET ?
      `,
      [Number(req.usuario?.id || 0), ...parametros, limit, offsetReal]
    );

    return res.json({
      success: true,
      data: {
        atividades,
        pagination: {
          page: paginaAtual,
          limit,
          total,
          totalPages: totalPaginas,
          hasPrevious: paginaAtual > 1,
          hasNext: paginaAtual < totalPaginas
        }
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro ao listar atividades."
    });
  }
}

async function buscarAtividade(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Atividade inválida."
      });
    }

    const [atividades] = await pool.execute(
      `
      SELECT
        a.id,
        a.tipo,
        a.distancia_metros,
        a.duracao_minutos,
        a.calorias,
        a.criado_em,
        u.id AS usuario_id,
        u.nome AS usuario_nome,
        u.foto AS usuario_foto
      FROM atividades a
      INNER JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.id = ?
      `,
      [id]
    );

    if (!atividades.length) {
      return res.status(404).json({
        success: false,
        message: "Atividade não encontrada."
      });
    }

    return res.json({
      success: true,
      data: atividades[0]
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar atividade."
    });
  }
}

async function criarAtividade(req, res) {
  try {
    const { tipo, distancia_metros, duracao_minutos, calorias } = req.body;

    if (!tipo || distancia_metros === undefined || duracao_minutos === undefined || calorias === undefined) {
      return res.status(400).json({
        success: false,
        message: "Campo obrigatório"
      });
    }

    const tipoNormalizado = String(tipo).toLowerCase().trim();
    const distancia = Number(distancia_metros);
    const duracao = Number(duracao_minutos);
    const caloriasNumero = Number(calorias);

    if (!TIPOS.includes(tipoNormalizado)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de atividade inválido."
      });
    }

    if (!Number.isFinite(distancia) || distancia <= 0 || !Number.isInteger(distancia)) {
      return res.status(400).json({
        success: false,
        message: "A distância deve ser um número inteiro positivo em metros."
      });
    }

    if (!Number.isFinite(duracao) || duracao <= 0 || !Number.isInteger(duracao)) {
      return res.status(400).json({
        success: false,
        message: "A duração deve ser um número inteiro positivo em minutos."
      });
    }

    if (!Number.isFinite(caloriasNumero) || caloriasNumero <= 0 || !Number.isInteger(caloriasNumero)) {
      return res.status(400).json({
        success: false,
        message: "A quantidade de calorias deve ser um número inteiro positivo."
      });
    }

    const [resultado] = await pool.execute(
      `
      INSERT INTO atividades
        (usuario_id, tipo, distancia_metros, duracao_minutos, calorias)
      VALUES (?, ?, ?, ?, ?)
      `,
      [req.usuario.id, tipoNormalizado, distancia, duracao, caloriasNumero]
    );

    const [novaAtividade] = await pool.execute(
      `
      SELECT
        a.id,
        a.tipo,
        a.distancia_metros,
        a.duracao_minutos,
        a.calorias,
        a.criado_em,
        u.id AS usuario_id,
        u.nome AS usuario_nome,
        u.foto AS usuario_foto
      FROM atividades a
      INNER JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.id = ?
      `,
      [resultado.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Atividade criada com sucesso.",
      data: novaAtividade[0]
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erro ao criar atividade."
    });
  }
}

module.exports = {
  listarAtividades,
  buscarAtividade,
  criarAtividade
};
