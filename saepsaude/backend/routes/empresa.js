const express = require("express");
const { buscarEmpresa } = require("../controllers/empresaController");

const router = express.Router();

router.get("/", buscarEmpresa);

module.exports = router;
