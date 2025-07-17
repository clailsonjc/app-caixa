let produtos = [];

fetch("produtos.txt")
  .then((response) => response.text())
  .then((texto) => {
    produtos = texto
      .split("\n")
      .map((linha) => linha.trim())
      .filter(Boolean)
      .map((linha) => {
        const nomeMatch = linha.match(/nome:\s*"(.+?)"/i);
        const precoMatch = linha.match(/preco:\s*([\d.]+)/i);
        return {
          nome: nomeMatch ? nomeMatch[1] : "DESCONHECIDO",
          preco: precoMatch ? parseFloat(precoMatch[1]) : 0,
        };
      });

    continuarApp(); // <<< chama o restante do código aqui
  });

// O restante do código vai dentro dessa função
function continuarApp() {
  const container = document.getElementById("box-container");
  const produtosList = document.getElementById("produtos-list");
  const totalGeral = document.getElementById("total-geral");
  const finalizarBtn = document.getElementById("finalizar-btn");
  const carrinho = {};

  produtos.sort((a, b) => {
    if (a.nome < b.nome) return -1;
    if (a.nome > b.nome) return 1;
    return 0;
  });

  produtos.forEach((produto) => {
    const box = document.createElement("div");
    box.classList.add("box");
    box.textContent = produto.nome;

    box.addEventListener("click", () => {
      if (!carrinho[produto.nome]) {
        carrinho[produto.nome] = { quantidade: 0, preco: produto.preco };
      }
      carrinho[produto.nome].quantidade += 1;
      atualizarLista();
    });

    container.appendChild(box);
  });

  function atualizarLista() {
    produtosList.innerHTML = "";
    let total = 0;

    Object.keys(carrinho).forEach((nome) => {
      const item = carrinho[nome];
      const subtotal = item.quantidade * item.preco;
      total += subtotal;

      const li = document.createElement("li");

      const btnSubtrair = document.createElement("button");
      btnSubtrair.textContent = "-";
      btnSubtrair.style.marginRight = "10px";
      btnSubtrair.addEventListener("click", () => {
        item.quantidade -= 1;
        if (item.quantidade <= 0) {
          delete carrinho[nome];
        }
        atualizarLista();
      });

      li.appendChild(btnSubtrair);

      const quantidadeStrong = document.createElement("strong");
      quantidadeStrong.textContent = `${item.quantidade}`;

      li.appendChild(quantidadeStrong);
      li.appendChild(
        document.createTextNode(
          `. ${nome} . x . R$ ${item.preco.toFixed(2)} = R$ ${subtotal.toFixed(
            2
          )}`
        )
      );

      produtosList.appendChild(li);
    });

    totalGeral.textContent = `Total Geral: R$ ${total.toFixed(2)}`;
    document.getElementById(
      "box-total"
    ).textContent = `Total:\nR$ ${total.toFixed(2)}`;
  }
  //************impressão************ */

  function imprimirRecibo() {
    let recibo = "**************************\n";
    let total = 0;
    recibo += "*** POC LANCHES-RECIBO ***\n\n";
    Object.keys(carrinho).forEach((nome) => {
      const item = carrinho[nome];
      const subtotal = item.quantidade * item.preco;
      total += subtotal;
      recibo += `${item.quantidade}x ${nome}\nR$ ${item.preco.toFixed(
        2
      )} = R$ ${subtotal.toFixed(2)}\n\n`;
      recibo += "--------------------------\n\n";
    });

    recibo += `TOTAL: R$ ${total.toFixed(2)}\n`;
    recibo += "**************************\n";
    recibo += "Obrigado pela preferência!";

    /*
    // Abrir nova janela para impressão
    const janela = window.open("", "", "width=300,height=400");
    janela.document.write(
      `<pre style="font-family: monospace; font-size:15px;">${recibo}</pre>`
    );
    janela.document.close();
    janela.print();
    janela.close();
    */

    // Abrir nova janela para impressão em html
    const original = document.body.innerHTML;
    document.body.innerHTML = `<pre style="font-family: monospace; font-size:14px;">${recibo}</pre>`;
    window.print();
    document.body.innerHTML = original; // volta para o app depois de imprimir



    
  }

  //***********impressão fim */
  finalizarBtn.addEventListener("click", () => {
    const total = Object.keys(carrinho).reduce((acc, nome) => {
      return acc + carrinho[nome].quantidade * carrinho[nome].preco;
    }, 0);

    document.getElementById(
      "modal-total"
    ).textContent = `Total: R$ ${total.toFixed(2)}`;
    document.getElementById("valor-pago").value = "";
    document.getElementById("modal-troco").textContent = "";
    document.getElementById("modal-confirmacao").style.display = "block";

    document.getElementById("calcular-btn").onclick = () => {
      const valorPago = parseFloat(document.getElementById("valor-pago").value);
      if (isNaN(valorPago)) {
        document.getElementById("modal-troco").textContent =
          "Digite um valor válido.";
        return;
      }
      const troco = valorPago - total;
      if (troco < 0) {
        document.getElementById(
          "modal-troco"
        ).textContent = `Valor insuficiente. Falta R$ ${Math.abs(troco).toFixed(
          2
        )}`;
      } else {
        document.getElementById(
          "modal-troco"
        ).textContent = `Troco: R$ ${troco.toFixed(2)}`;
      }
    };

    document.getElementById("confirmar-btn").onclick = () => {
      document.getElementById("modal-confirmacao").style.display = "none";
      imprimirRecibo(); // imprime antes de recarregar
      location.reload();
    };

    document.getElementById("cancelar-btn").onclick = () => {
      document.getElementById("modal-confirmacao").style.display = "none";
    };
  });
}

