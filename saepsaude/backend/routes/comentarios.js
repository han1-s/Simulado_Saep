const express = require("express");
const {
  listarComentarios,
  criarComentario
} = require("../controllers/comentarioController");
const autenticar = require("../middleware/auth");

const router = express.Router();

router.get("/atividades/:id/comentarios", autenticar, listarComentarios);
router.post("/atividades/:id/comentarios", autenticar, criarComentario);

module.exports = router;
