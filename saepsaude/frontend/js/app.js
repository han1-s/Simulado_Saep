const state = {
  usuario: null,
  token: localStorage.getItem("saepsaude_token"),
  tipoFiltro: "",
  pagina: 1,
  limite: 4,
  totalPaginas: 1,
  atividades: []
};

const elements = {
  companyLogo: document.getElementById("company-logo"),
  companyName: document.getElementById("company-name"),
  companyActivities: document.getElementById("company-activities"),
  companyCalories: document.getElementById("company-calories"),
  activityNav: document.getElementById("activity-nav"),
  loginButton: document.getElementById("login-button"),
  logoutButton: document.getElementById("logout-button"),
  loginModal: document.getElementById("login-modal"),
  closeLogin: document.getElementById("close-login"),
  cancelLogin: document.getElementById("cancel-login"),
  loginForm: document.getElementById("login-form"),
  loginMessage: document.getElementById("login-message"),
  filters: [...document.querySelectorAll(".filter-button")],
  clearFilter: document.getElementById("clear-filter"),
  loginGate: document.getElementById("login-gate"),
  feedSection: document.getElementById("feed-section"),
  feedTitle: document.getElementById("feed-title"),
  activitiesList: document.getElementById("activities-list"),
  emptyState: document.getElementById("empty-state"),
  pagination: document.getElementById("pagination"),
  pageNumbers: document.getElementById("page-numbers"),
  pageSizeSelect: document.getElementById("page-size-select"),
  createSection: document.getElementById("activity-create-section"),
  activityForm: document.getElementById("activity-form"),
  activityFormMessage: document.getElementById("activity-form-message"),
  backToFeed: document.getElementById("back-to-feed"),
  profileSection: document.getElementById("profile-section"),
  userPhoto: document.getElementById("user-photo"),
  userName: document.getElementById("user-name"),
  userEmail: document.getElementById("user-email"),
  userActivities: document.getElementById("user-activities"),
  userCalories: document.getElementById("user-calories")
};

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {
  configurarEventos();
  await carregarEmpresa();

  if (state.token) {
    try {
      await carregarUsuarioAtual();
      atualizarInterfaceAutenticada();
    } catch {
      encerrarSessaoLocal();
    }
  } else {
    atualizarInterfaceDeslogada();
  }

  await carregarAtividades();
}

function configurarEventos() {
  elements.loginButton.addEventListener("click", abrirLogin);
  elements.closeLogin.addEventListener("click", fecharLogin);
  elements.cancelLogin.addEventListener("click", fecharLogin);
  elements.loginModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-login]")) fecharLogin();
  });

  elements.loginForm.addEventListener("submit", realizarLogin);

  elements.filters.forEach((button) => {
    if (button.dataset.filter) {
      button.addEventListener("click", () => aplicarFiltro(button.dataset.filter));
    }
  });

  elements.clearFilter.addEventListener("click", () => aplicarFiltro(""));

  elements.pageSizeSelect.addEventListener("change", () => {
    state.limite = Number(elements.pageSizeSelect.value);
    state.pagina = 1;
    carregarAtividades();
  });

  elements.pagination.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page-action]");
    const pageButton = event.target.closest("[data-page-number]");

    if (pageButton) {
      irParaPagina(Number(pageButton.dataset.pageNumber));
      return;
    }

    if (!button || button.disabled || !state.usuario) {
      if (button && !state.usuario) abrirLogin();
      return;
    }

    const action = button.dataset.pageAction;

    if (action === "first") irParaPagina(1);
    if (action === "previous") irParaPagina(state.pagina - 1);
    if (action === "next") irParaPagina(state.pagina + 1);
    if (action === "last") irParaPagina(state.totalPaginas);
  });

  elements.activityNav.addEventListener("click", () => {
    if (!state.usuario) {
      abrirLogin();
      return;
    }

    elements.createSection.classList.remove("hidden");
    elements.feedSection.classList.add("hidden");
    elements.profileSection.classList.add("hidden");
    elements.activityNav.classList.add("selected");
    elements.activityForm.reset();
    limparErrosFormulario(elements.activityForm);
    elements.activityFormMessage.textContent = "";
  });

  elements.backToFeed.addEventListener("click", () => {
    elements.createSection.classList.add("hidden");
    elements.feedSection.classList.remove("hidden");
    elements.profileSection.classList.toggle("hidden", !state.usuario);
    elements.activityNav.classList.remove("selected");
  });

  elements.activityForm.addEventListener("submit", criarAtividade);
  elements.logoutButton.addEventListener("click", realizarLogout);
}

async function carregarEmpresa() {
  try {
    const resposta = await requisicao("/empresa");
    const empresa = resposta.data;

    elements.companyLogo.src = empresa.logo;
    elements.companyName.textContent = empresa.nome;
    elements.companyActivities.textContent = formatarNumero(empresa.total_atividades);
    elements.companyCalories.textContent = formatarNumero(empresa.total_calorias);
  } catch (error) {
    console.error(error);
  }
}

async function carregarUsuarioAtual() {
  const payload = decodificarToken(state.token);

  if (!payload?.id) {
    throw new Error("Token inválido.");
  }

  const resposta = await requisicao(`/usuarios/${payload.id}`);
  state.usuario = resposta.data;
}

function decodificarToken(token) {
  try {
    const parte = token.split(".")[1];
    return JSON.parse(decodeURIComponent(
      atob(parte.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    ));
  } catch {
    return null;
  }
}

function atualizarInterfaceAutenticada() {
  elements.loginButton.classList.add("hidden");
  elements.logoutButton.classList.remove("hidden");
  elements.activityNav.disabled = false;
  elements.loginGate.classList.add("hidden");
  elements.profileSection.classList.remove("hidden");

  elements.userPhoto.src = state.usuario.foto;
  elements.userName.textContent = state.usuario.nome;
  elements.userEmail.textContent = state.usuario.email;
  elements.userActivities.textContent = formatarNumero(state.usuario.total_atividades);
  elements.userCalories.textContent = formatarNumero(state.usuario.total_calorias);
}

function atualizarInterfaceDeslogada() {
  elements.loginButton.classList.remove("hidden");
  elements.logoutButton.classList.add("hidden");
  elements.activityNav.disabled = true;
  elements.profileSection.classList.add("hidden");
  elements.loginGate.classList.remove("hidden");
}

function abrirLogin() {
  elements.loginModal.classList.remove("hidden");
  elements.loginMessage.textContent = "";
  limparErrosFormulario(elements.loginForm);
  setTimeout(() => document.getElementById("login-email").focus(), 0);
}

function fecharLogin() {
  elements.loginModal.classList.add("hidden");
  elements.loginForm.reset();
  elements.loginMessage.textContent = "";
  limparErrosFormulario(elements.loginForm);
}

async function realizarLogin(event) {
  event.preventDefault();
  limparErrosFormulario(elements.loginForm);
  elements.loginMessage.textContent = "";

  const email = document.getElementById("login-email");
  const senha = document.getElementById("login-password");

  let valido = true;

  if (!email.value.trim()) {
    marcarErro(email, "email ou senha obrigatório");
    valido = false;
  }

  if (!senha.value.trim()) {
    marcarErro(senha, "email ou senha obrigatório");
    valido = false;
  }

  if (!valido) return;

  try {
    const resposta = await requisicao("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: email.value,
        senha: senha.value
      })
    });

    state.token = resposta.data.token;
    state.usuario = resposta.data.usuario;
    localStorage.setItem("saepsaude_token", state.token);

    fecharLogin();
    atualizarInterfaceAutenticada();
    state.pagina = 1;
    state.tipoFiltro = "";
    atualizarFiltros();
    elements.createSection.classList.add("hidden");
    elements.feedSection.classList.remove("hidden");
    await carregarUsuarioAtual();
    atualizarInterfaceAutenticada();
    await carregarAtividades();
  } catch (error) {
    elements.loginMessage.textContent = error.message || "email ou senha incorreta";
    marcarErro(email, "email ou senha incorreta");
    marcarErro(senha, "email ou senha incorreta");
  }
}

async function realizarLogout() {
  try {
    if (state.token) {
      await requisicao("/auth/logout", { method: "POST" });
    }
  } catch {
  } finally {
    encerrarSessaoLocal();
    elements.createSection.classList.add("hidden");
    elements.feedSection.classList.remove("hidden");
    elements.activityNav.classList.remove("selected");
    state.pagina = 1;
    state.tipoFiltro = "";
    atualizarFiltros();
    atualizarInterfaceDeslogada();
    await carregarAtividades();
  }
}

function encerrarSessaoLocal() {
  state.token = null;
  state.usuario = null;
  localStorage.removeItem("saepsaude_token");
}

async function aplicarFiltro(tipo) {
  if (!state.usuario) {
    abrirLogin();
    return;
  }

  state.tipoFiltro = tipo;
  state.pagina = 1;
  atualizarFiltros();
  await carregarAtividades();
}

function atualizarFiltros() {
  elements.filters.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === state.tipoFiltro);
  });
  elements.clearFilter.classList.toggle("active", state.tipoFiltro === "");
}

async function carregarAtividades() {
  try {
    const params = new URLSearchParams({
      page: state.pagina,
      limit: state.limite
    });

    if (state.tipoFiltro) {
      params.set("tipo", state.tipoFiltro);
    }

    const resposta = await requisicao(`/atividades?${params.toString()}`);
    state.atividades = resposta.data.atividades;
    state.pagina = resposta.data.pagination.page;
    state.totalPaginas = resposta.data.pagination.totalPages;

    renderizarAtividades();
    renderizarPaginacao(resposta.data.pagination);
  } catch (error) {
    elements.activitiesList.innerHTML = "";
    elements.emptyState.classList.remove("hidden");
    elements.emptyState.textContent = error.message;
    elements.pagination.classList.add("hidden");
  }
}

function renderizarAtividades() {
  elements.activitiesList.innerHTML = "";

  if (!state.atividades.length) {
    elements.emptyState.classList.remove("hidden");
    elements.emptyState.textContent = "Nenhuma atividade encontrada.";
    return;
  }

  elements.emptyState.classList.add("hidden");

  state.atividades.forEach((atividade) => {
    const template = document.getElementById("activity-template");
    const card = template.content.cloneNode(true);
    const article = card.querySelector(".activity-card");

    article.dataset.id = atividade.id;

    card.querySelector(".activity-title").textContent = atividade.tipo;
    card.querySelector(".activity-date").textContent = formatarData(atividade.criado_em);

    const userPhoto = card.querySelector(".activity-user-photo");
    userPhoto.src = atividade.usuario_foto;
    userPhoto.alt = `Foto de ${atividade.usuario_nome}`;

    card.querySelector(".activity-user-name").textContent = atividade.usuario_nome;
    card.querySelector(".metric-distance").textContent = `${converterDistancia(atividade.distancia_metros)} km`;
    card.querySelector(".metric-duration").textContent = converterDuracao(atividade.duracao_minutos);
    card.querySelector(".metric-calories").textContent = formatarNumero(atividade.calorias);
    card.querySelector(".like-count").textContent = atividade.total_likes;
    card.querySelector(".comment-count").textContent = atividade.total_comentarios;

    const likeButton = card.querySelector(".like-button");

    if (Number(atividade.usuario_curtiu) === 1) {
      likeButton.classList.add("liked");
      likeButton.querySelector("img").style.filter = "invert(13%) sepia(100%) saturate(7477%) hue-rotate(1deg) brightness(104%) contrast(118%)";
    }

    likeButton.addEventListener("click", () => alternarCurtida(atividade.id, article));

    const commentButton = card.querySelector(".comment-button");
    commentButton.addEventListener("click", () => alternarComentarios(atividade.id, article));

    const commentForm = card.querySelector(".comment-form");
    commentForm.addEventListener("submit", (event) => enviarComentario(event, atividade.id, article));

    elements.activitiesList.appendChild(card);
  });
}

function renderizarPaginacao(pagination) {
  elements.pagination.classList.remove("hidden");

  const buttons = elements.pagination.querySelectorAll("[data-page-action]");
  buttons.forEach((button) => {
    if (button.dataset.pageAction === "first" || button.dataset.pageAction === "previous") {
      button.disabled = !state.usuario || !pagination.hasPrevious;
    }

    if (button.dataset.pageAction === "next" || button.dataset.pageAction === "last") {
      button.disabled = !state.usuario || !pagination.hasNext;
    }
  });

  elements.pageNumbers.innerHTML = "";

  for (let pagina = 1; pagina <= pagination.totalPages; pagina += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "page-number";
    button.dataset.pageNumber = pagina;
    button.textContent = pagina;
    button.setAttribute("aria-label", `Página ${pagina}`);

    if (pagina === pagination.page) {
      button.classList.add("active");
    }

    elements.pageNumbers.appendChild(button);
  }
}

async function irParaPagina(pagina) {
  if (!state.usuario) {
    abrirLogin();
    return;
  }

  if (pagina < 1 || pagina > state.totalPaginas) return;

  state.pagina = pagina;
  await carregarAtividades();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function alternarCurtida(atividadeId, article) {
  if (!state.usuario) {
    abrirLogin();
    return;
  }

  const button = article.querySelector(".like-button");
  const liked = button.classList.contains("liked");

  try {
    const resposta = await requisicao(`/atividades/${atividadeId}/like`, {
      method: liked ? "DELETE" : "POST"
    });

    const novaQuantidade = resposta.data.total_likes;
    article.querySelector(".like-count").textContent = novaQuantidade;
    button.classList.toggle("liked", resposta.data.curtiu);

    if (resposta.data.curtiu) {
      button.querySelector("img").style.filter = "invert(13%) sepia(100%) saturate(7477%) hue-rotate(1deg) brightness(104%) contrast(118%)";
    } else {
      button.querySelector("img").style.filter = "";
    }
  } catch (error) {
    alert(error.message);
  }
}

async function alternarComentarios(atividadeId, article) {
  if (!state.usuario) {
    abrirLogin();
    return;
  }

  const area = article.querySelector(".comment-area");

  if (!area.classList.contains("hidden")) {
    area.classList.add("hidden");
    return;
  }

  area.classList.remove("hidden");

  try {
    const resposta = await requisicao(`/atividades/${atividadeId}/comentarios`);
    renderizarComentarios(resposta.data, article);
  } catch (error) {
    article.querySelector(".comment-message").textContent = error.message;
  }
}

function renderizarComentarios(comentarios, article) {
  const list = article.querySelector(".comments-list");
  list.innerHTML = "";

  if (!comentarios.length) {
    const vazio = document.createElement("p");
    vazio.textContent = "Ainda não há comentários.";
    vazio.style.color = "#747783";
    vazio.style.fontSize = "12px";
    list.appendChild(vazio);
    return;
  }

  comentarios.forEach((comentario) => {
    const item = document.createElement("div");
    item.className = "comment-item";

    const image = document.createElement("img");
    image.src = comentario.usuario_foto;
    image.alt = `Foto de ${comentario.usuario_nome}`;

    const content = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = comentario.usuario_nome;

    const text = document.createElement("p");
    text.textContent = comentario.texto;

    content.append(name, text);
    item.append(image, content);
    list.appendChild(item);
  });
}

async function enviarComentario(event, atividadeId, article) {
  event.preventDefault();

  if (!state.usuario) {
    abrirLogin();
    return;
  }

  const form = event.currentTarget;
  const input = form.querySelector("input");
  const message = article.querySelector(".comment-message");
  const texto = input.value.trim();

  message.textContent = "";

  if (texto.length <= 2) {
    message.textContent = "não é possível enviar um comentário vazio";
    input.focus();
    return;
  }

  try {
    const resposta = await requisicao(`/atividades/${atividadeId}/comentarios`, {
      method: "POST",
      body: JSON.stringify({ texto })
    });

    input.value = "";

    const count = article.querySelector(".comment-count");
    count.textContent = Number(count.textContent) + 1;

    const comentariosResposta = await requisicao(`/atividades/${atividadeId}/comentarios`);
    renderizarComentarios(comentariosResposta.data, article);

    message.textContent = resposta.message;
    setTimeout(() => {
      message.textContent = "";
    }, 1800);
  } catch (error) {
    message.textContent = error.message;
  }
}

async function criarAtividade(event) {
  event.preventDefault();

  limparErrosFormulario(elements.activityForm);
  elements.activityFormMessage.textContent = "";

  const tipo = document.getElementById("activity-type");
  const distancia = document.getElementById("activity-distance");
  const duracao = document.getElementById("activity-duration");
  const calorias = document.getElementById("activity-calories");

  const campos = [
    [tipo, "Campo obrigatório"],
    [distancia, "Campo obrigatório"],
    [duracao, "Campo obrigatório"],
    [calorias, "Campo obrigatório"]
  ];

  let valido = true;

  campos.forEach(([campo, mensagem]) => {
    if (!campo.value.trim()) {
      marcarErro(campo, mensagem);
      valido = false;
    }
  });

  if (!valido) return;

  try {
    await requisicao("/atividades", {
      method: "POST",
      body: JSON.stringify({
        tipo: tipo.value,
        distancia_metros: Number(distancia.value),
        duracao_minutos: Number(duracao.value),
        calorias: Number(calorias.value)
      })
    });

    elements.activityFormMessage.style.color = "#333333";
    elements.activityFormMessage.textContent = "Atividade criada com sucesso.";
    elements.activityForm.reset();

    await carregarEmpresa();
    await carregarUsuarioAtual();
    atualizarInterfaceAutenticada();

    state.tipoFiltro = "";
    state.pagina = 1;
    atualizarFiltros();

    elements.createSection.classList.add("hidden");
    elements.feedSection.classList.remove("hidden");
    elements.profileSection.classList.remove("hidden");
    elements.activityNav.classList.remove("selected");

    await carregarAtividades();
  } catch (error) {
    elements.activityFormMessage.style.color = "#FF0000";
    elements.activityFormMessage.textContent = error.message;
  }
}

function marcarErro(input, mensagem) {
  const field = input.closest(".field");
  field?.classList.add("invalid");

  const error = document.querySelector(`[data-error-for="${input.id}"]`);
  if (error) error.textContent = mensagem;
}

function limparErrosFormulario(form) {
  form.querySelectorAll(".field").forEach((field) => field.classList.remove("invalid"));
  form.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
}

function formatarNumero(valor) {
  return new Intl.NumberFormat("pt-BR").format(Number(valor || 0));
}

function converterDistancia(metros) {
  return (Number(metros) / 1000).toLocaleString("pt-BR", {
    minimumFractionDigits: Number(metros) % 1000 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  });
}

function converterDuracao(minutos) {
  const total = Number(minutos);
  const horas = Math.floor(total / 60);
  const minutosRestantes = total % 60;

  if (horas === 0) return `${minutosRestantes} min`;
  if (minutosRestantes === 0) return `${horas}h`;
  return `${horas}h ${minutosRestantes}min`;
}

function formatarData(data) {
  const valor = new Date(data);

  if (Number.isNaN(valor.getTime())) return "";

  const hora = String(valor.getHours()).padStart(2, "0");
  const minuto = String(valor.getMinutes()).padStart(2, "0");
  const dia = String(valor.getDate()).padStart(2, "0");
  const mes = String(valor.getMonth() + 1).padStart(2, "0");
  const ano = String(valor.getFullYear()).slice(-2);

  return `${hora}:${minuto} - ${dia}/${mes}/${ano}`;
}
