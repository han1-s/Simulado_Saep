const express = require("express");
const {
  statusCurtida,
  adicionarCurtida,
  removerCurtida
} = require("../controllers/curtidaController");
const autenticar = require("../middleware/auth");

const router = express.Router();

router.get("/atividades/:id/like", autenticar, statusCurtida);
router.post("/atividades/:id/like", autenticar, adicionarCurtida);
router.delete("/atividades/:id/like", autenticar, removerCurtida);

module.exports = router;
