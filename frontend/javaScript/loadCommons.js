"use strict";

export async function loadCommonElements() {
  fetch("common/newProductModal.html")
    .then((response) => response.text())
    .then((data) => {
      document.body.insertAdjacentHTML("beforeend", data);
    })
    .catch((error) => console.error("Erro ao carregar o modal:", error));

  fetch("common/header.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("header").innerHTML = data;
    })
    .then(() => {
      welcomeMessage();
      addModalListeners();
    })
    .catch((error) => console.error("Erro ao carregar o cabeçalho:", error));

  fetch("common/footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("footer").innerHTML = data;
    })
    .catch((error) => console.error("Erro ao carregar o rodapé:", error));
}

async function welcomeMessage() {
  let user = null;
  const profilePicture = document.getElementById("profile-picture");
  const openModalBtn = document.getElementById("openModalBtn");
  const welcomeMessage = document.getElementById("welcome-message");
  const logoutButton = document.getElementById("botao-logout");
  const loginButton = document.getElementById("botao-login");
  try {
    user = JSON.parse(sessionStorage.getItem("user"));
  } catch (error) {
    console.error("Erro a ler user da sessionStorage", error);
  }

  if (user) {
    openModalBtn.classList.remove("hidden");
    welcomeMessage.classList.remove("hidden");
    logoutButton.classList.remove("hidden");
    loginButton.classList.add("hidden");
    profilePicture.classList.remove("hidden");
    profilePicture.src = user.imagem;
    welcomeMessage.innerHTML = `<a href="perfil_utilizador.html">Bem-vindo/a ${user.nome}</a>!`;

    logoutButton.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "index.html";
    });
  } else {
    openModalBtn.classList.add("hidden");
    loginButton.classList.remove("hidden");
    logoutButton.classList.add("hidden");
    welcomeMessage.classList.add("hidden");
    profilePicture.classList.add("hidden");
  }
}

async function addModalListeners() {
  const modal = document.getElementById("modal");
  const btn = document.getElementById("openModalBtn");
  const span = document.getElementsByClassName("close")[0];
  const cancel = document.getElementById("cancelar");
  const form = document.getElementById("form-novo-produto");

  btn.onclick = function () {
    modal.style.display = "block";
  };

  cancel.onclick = function () {
    modal.style.display = "none";
    form.reset();
  };

  span.onclick = function () {
    modal.style.display = "none";
    form.reset();
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      form.reset();
    }
  };
}

async function sendNewProductReq(product) {
  const requestURL = productsPath;
  const request = new Request(requestURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const response = await fetch(request);
  const result = await response.json();
  return result;
}
