const tabela = document.querySelector("#tabelaResultados tbody");
let produtos = JSON.parse(localStorage.getItem("produtos_precificados") || "[]");

function sanitize(valor) {
  return parseFloat(String(valor).replace(',', '.')) || 0;
}

function salvarTaxas() {
  localStorage.setItem("taxas_config", JSON.stringify({
    comissaoShopee: document.getElementById("comissaoShopee").value,
    taxaShopee: document.getElementById("taxaShopee").value,
    comissaoML: document.getElementById("comissaoML").value,
    taxaML: document.getElementById("taxaML").value
  }));
}

function restaurarTaxas() {
  const config = JSON.parse(localStorage.getItem("taxas_config") || "{}");
  if (config.comissaoShopee) document.getElementById("comissaoShopee").value = config.comissaoShopee;
  if (config.taxaShopee) document.getElementById("taxaShopee").value = config.taxaShopee;
  if (config.comissaoML) document.getElementById("comissaoML").value = config.comissaoML;
  if (config.taxaML) document.getElementById("taxaML").value = config.taxaML;
}

function calcularSalvar() {
  const nome = document.getElementById("nomeProduto").value.trim();
  const custo = sanitize(document.getElementById("custoProduto").value);
  const taxaShopee = sanitize(document.getElementById("taxaShopee").value);
  const comissaoShopee = sanitize(document.getElementById("comissaoShopee").value) / 100;
  const taxaML = sanitize(document.getElementById("taxaML").value);
  const comissaoML = sanitize(document.getElementById("comissaoML").value) / 100;

  if (!nome || custo <= 0) {
    alert("Preencha corretamente os campos obrigatórios.");
    return;
  }

  salvarTaxas();

  const precoShopee = ((custo + taxaShopee) / (1 - comissaoShopee)).toFixed(2);
  const precoML = ((custo + taxaML) / (1 - comissaoML)).toFixed(2);
  const lucroShopee = (precoShopee - custo).toFixed(2);
  const lucroML = (precoML - custo).toFixed(2);

  const produto = {
    nome,
    custo: custo.toFixed(2),
    precoShopee,
    precoML,
    lucroShopee,
    lucroML
  };

  produtos.push(produto);
  localStorage.setItem("produtos_precificados", JSON.stringify(produtos));
  renderizarTabela();
}

function excluirProduto(index) {
  if (confirm("Deseja realmente excluir este produto?")) {
    produtos.splice(index, 1);
    localStorage.setItem("produtos_precificados", JSON.stringify(produtos));
    renderizarTabela();
  }
}

function renderizarTabela() {
  const filtro = document.getElementById("filtroBusca").value.toLowerCase();
  tabela.innerHTML = "";
  produtos.forEach((p, index) => {
    if (p.nome.toLowerCase().includes(filtro)) {
      tabela.innerHTML += `
        <tr>
          <td>${p.nome}</td>
          <td>R$ ${p.custo}</td>
          <td>R$ ${p.precoShopee}</td>
          <td>R$ ${p.lucroShopee}</td>
          <td>R$ ${p.precoML}</td>
          <td>R$ ${p.lucroML}</td>
          <td><button class="btn-excluir" onclick="excluirProduto(${index})"><i class="fas fa-trash-alt"></i> Excluir</button></td>
        </tr>`;
    }
  });
}

function exportarCSV() {
  let csv = "Produto,Custo,Shopee,Lucro Shopee,ML,Lucro ML
";
  produtos.forEach(p => {
    csv += `${p.nome},${p.custo},${p.precoShopee},${p.lucroShopee},${p.precoML},${p.lucroML}
`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "produtos_precificados.csv";
  link.click();
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Produtos Precificados", 10, 10);
  let y = 20;
  produtos.forEach((p, i) => {
    doc.text(`${i + 1}. ${p.nome} | Custo: R$${p.custo} | Shopee: R$${p.precoShopee} | Lucro: R$${p.lucroShopee} | ML: R$${p.precoML} | Lucro: R$${p.lucroML}`, 10, y);
    y += 10;
  });
  doc.save("produtos_precificados.pdf");
}

function alternarModo() {
  document.body.classList.toggle("dark");
  localStorage.setItem("modo_escuro", document.body.classList.contains("dark") ? "1" : "0");
}

function restaurarModo() {
  const escuro = localStorage.getItem("modo_escuro");
  if (escuro === "1") {
    document.body.classList.add("dark");
  }
}

restaurarTaxas();
restaurarModo();
renderizarTabela();