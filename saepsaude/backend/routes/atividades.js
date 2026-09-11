const express = require("express");
const {
  listarAtividades,
  buscarAtividade,
  criarAtividade
} = require("../controllers/atividadeController");
const autenticar = require("../middleware/auth");

const router = express.Router();

router.get("/", listarAtividades);
router.get("/:id", buscarAtividade);
router.post("/", autenticar, criarAtividade);

module.exports = router;
