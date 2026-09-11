const express = require("express");
const { buscarUsuario } = require("../controllers/usuarioController");
const autenticar = require("../middleware/auth");

const router = express.Router();

router.get("/:id", autenticar, buscarUsuario);

module.exports = router;
