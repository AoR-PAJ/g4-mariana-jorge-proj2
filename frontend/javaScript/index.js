"use strict";

const rootPath = "http://localhost:8080/mariana-jorge-proj2/rest";
const productsPath = `${rootPath}/products`;
const getAllProductsURL = `${rootPath}/products/all`;
const loginRequestURL = `${rootPath}/users/login`; // URL para o pedido de login

if (window.location.pathname.endsWith("index.html")) {
  document.addEventListener("DOMContentLoaded", () => {
    displayMostRecentProducts();
    displayMostRatedProducts();
  });
}

async function getAllProducts() {
  const requestURL = getAllProductsURL;
  const request = new Request(requestURL, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  const response = await fetch(request);
  const products = await response.json();
  return products;
}

async function addProduct(product) {
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

async function displayMostRecentProducts() {
  const mainContainer = document.querySelector(".recent-products");
  const products = await getAllProducts();
  const mostRecentProducts = products
    .sort((a, b) => new Date(b.dataDePublicacao) - new Date(a.dataDePublicacao))
    .slice(0, 3);
  mainContainer.innerHTML = "";
  mostRecentProducts.forEach((p) => {
    const card = createCard(p);
    mainContainer.appendChild(card);
  });
}

async function displayMostRatedProducts() {
  const mainContainer = document.querySelector(".most-rated-products");
  const products = await getAllProducts();
  const mostRatedProducts = products
    .map((product) => ({
      ...product,
      mediaEstrelas: gerarRating(product.avaliacoes).mediaEstrelas,
    }))
    .sort((a, b) => b.mediaEstrelas - a.mediaEstrelas)
    .slice(0, 3);
  mainContainer.innerHTML = "";
  mostRatedProducts.forEach((p) => {
    const card = createCard(p);
    mainContainer.appendChild(card);
  });
}

// Cria a card do produto
function createCard(product) {
  const rating = gerarRating(product.avaliacoes);
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${product.imagem}" alt="${product.titulo}" />
    <div>
      <h1>${product.titulo}</h1>
      <h4>${product.local}</h4>
      <h2>${product.categoria}</h2>
      <h3 class="rating">${rating.estrelas}</h3>
      <span>${parseFloat(product.preco).toFixed(2)}€</span>
      <button type="button" title="descricao">Saber mais</button>
    </div>
  `;
  const button = card.querySelector("button");
  button.addEventListener("click", () => {
    window.location.href = `detalhes-produtos.html?id=${product.id}`;
  });
  return card;
}

// Gera o rating de cada produto conforme definido no ficheiro .json.
function gerarRating(avaliacoes) {
  let totalEstrelas = 0;
  for (let avaliacao of avaliacoes) {
    totalEstrelas += avaliacao.estrelas;
  }
  let mediaEstrelas =
    avaliacoes.length > 0 ? totalEstrelas / avaliacoes.length : 0;
  let estrelas = "";
  for (let i = 0; i < 5; i++) {
    if (i < mediaEstrelas) {
      estrelas += "&#9733";
    } else {
      estrelas += "&#10032";
    }
  }
  return { mediaEstrelas, estrelas };
}

async function gerarDetalhesDoProduto() {
  const produtos = await getAllProducts();
  const containerDetalhes = document.querySelector(".detalhes-container");
  const urlParams = new URLSearchParams(window.location.search);
  const idDoProduto = urlParams.get("id");
  containerDetalhes.innerHTML = "";

  const produto = produtos.find((prod) => prod.id === idDoProduto);

  if (produto) {
    containerDetalhes.innerHTML = `
    <div class="imagem">
      <img src="${produto.imagem}" alt="${produto.titulo}" />
    </div>
    <div class="detalhes">
      <h1>${produto.titulo}</h1>
      <h4>${produto.local}</h4>
      <h2>${produto.categoria}</h2>
      <a id="link-avaliacoes" href="#">
      <h3>
        ${
          produto.avaliacoes.length == 0
            ? "Sem avaliações"
            : gerarRating(produto.avaliacoes)
        }
        <span id="numero-avaliacoes">
        (${produto.avaliacoes.length} avaliações)
        </span>
      </h3>
      </a>
      <h6>${parseFloat(produto.preco).toFixed(2)}€</h6>
      <h2>Publicado por ${produto.userAutor} em ${produto.dataDePublicacao}<h2>
      <p>${produto.descricao}</p>
      <button type="button" title="Enviar Mensagem\nFuncionalidade não implementada">
    Enviar Mensagem <i class="fa fa-paper-plane-o" aria-hidden="true"></i>
    </button>
      <button type="button" title="Editar Produto" onclick="mostrarFormularioEdicao('${
        produto.id
      }')">Editar <i class="fa fa-pencil" aria-hidden="true"></i></button>
      <button type="button" title="Eliminar Produto" onclick="eliminarProduto('${
        produto.id
      }')">Eliminar <i class="fa fa-times" aria-hidden="true"></i></button>
    </div>
    `;

    let avaliacoesVisiveis = false;
    document
      .getElementById("link-avaliacoes")
      .addEventListener("click", function (event) {
        event.preventDefault();
        const avaliacoesContainer = document.querySelector(".avaliacoes");
        if (avaliacoesVisiveis) {
          avaliacoesContainer.innerHTML = "";
        } else {
          avaliacoesContainer.innerHTML = "";
          produto.avaliacoes.forEach((avaliacao) => {
            const avaliacaoElement = document.createElement("div");
            avaliacaoElement.className = "avaliacao";
            avaliacaoElement.innerHTML = `
              <h4>
              ${avaliacao.autor}  <span>(${avaliacao.data})<span>
              </h4>
              <div class="rating">${gerarRating([avaliacao])}</div>
              <p>${avaliacao.texto}</p>
              <hr id="separador" />
            `;
            avaliacoesContainer.appendChild(avaliacaoElement);
          });
        }
        avaliacoesVisiveis = !avaliacoesVisiveis;
      });
  } else {
    alert("Produto não encontrado!");
  }
}

/* LOGIN */
async function submitLoginForm() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  const loginData = {
    username: username,
    password: password,
  };

  const requestURL = loginRequestURL;
  const welcomeMessage = document.getElementById("bem-vindo-container");
  const response = await fetch(requestURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  if (response.ok) {
    const result = await response.json();
    alert("Login bem sucedido! Bem- vindo/a, " + result.nome);
    console.log("login successful", result);
    // TODO: adicionar o nome do utilizador à sessionStorage e redicionar para a página principal
    sessionStorage.setItem(
      "user",
      JSON.stringify({ username: result.username, password: password })
    );
    window.location.href = "index.html";

    if (user) {
      welcomeMessage.style.display = "block";
      welcomeMessage.innerHTML = `<a href="pagina_perfil_utilizador.html">${result.username}</a>!`;
      document.getElementById("botao-login").style.display = "none";
    } else {
      alert("Login falhou! Por favor verifique as suas credenciais.");
    }
  }
}
