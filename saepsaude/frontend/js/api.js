const API_BASE = "/api";

function obterToken() {
  return localStorage.getItem("saepsaude_token");
}

async function requisicao(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = obterToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const resposta = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  let corpo;

  try {
    corpo = await resposta.json();
  } catch {
    corpo = {
      success: false,
      message: "Resposta inválida do servidor."
    };
  }

  if (!resposta.ok) {
    const erro = new Error(corpo.message || "Erro na requisição.");
    erro.status = resposta.status;
    throw erro;
  }

  return corpo;
}
