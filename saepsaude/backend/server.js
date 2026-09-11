require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const usuarioRoutes = require("./routes/usuarios");
const empresaRoutes = require("./routes/empresa");
const atividadeRoutes = require("./routes/atividades");
const curtidaRoutes = require("./routes/curtidas");
const comentarioRoutes = require("./routes/comentarios");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/empresa", empresaRoutes);
app.use("/api/atividades", atividadeRoutes);
app.use("/api", curtidaRoutes);
app.use("/api", comentarioRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API SAEPSaúde funcionando."
  });
});

const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Erro interno do servidor."
  });
});

app.listen(PORT, () => {
  console.log(`Servidor SAEPSaúde rodando em http://localhost:${PORT}`);
});
