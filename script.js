document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("orcamento-form");
  const resultado = document.getElementById("resultado");

  form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!validarFormulario()) {
          return; // Interrompe a execução se a validação falhar
      }

      const dadosOrcamento = coletarDadosFormulario();
      const precosBase = calcularPrecoBase(dadosOrcamento.valorClassic, dadosOrcamento.incluirInformacoes);
      const precoTotal = calcularPrecoTotal(precosBase, dadosOrcamento.categoriasSelecionadas, dadosOrcamento.dataCheckin, dadosOrcamento.dataCheckout);
      const textoOrcamento = gerarTextoOrcamento(dadosOrcamento, precoTotal, precosBase);

      // Exibir o texto na div resultado com formatação HTML
      resultado.innerHTML = textoOrcamento;
      resultado.style.display = "block"; // Mostrar a div resultado
  });

  function validarFormulario() {
      const dataCheckin = document.getElementById("data-checkin").value;
      const dataCheckout = document.getElementById("data-checkout").value;
      const dataCheckinObj = new Date(dataCheckin);
      const dataCheckoutObj = new Date(dataCheckout);

      if (dataCheckinObj >= dataCheckoutObj) {
          alert("A data de check-out deve ser posterior à data de check-in.");
          return false;
      }

      return true; // Retorna verdadeiro se todas as validações passarem
  }

  function coletarDadosFormulario() {
      return {
          nome: document.getElementById("nome").value,
          dataCheckin: document.getElementById("data-checkin").value,
          dataCheckout: document.getElementById("data-checkout").value,
          adultos: parseInt(document.getElementById("adultos").value),
          criancas: parseInt(document.getElementById("criancas").value),
          valorClassic: parseFloat(document.getElementById("valor-classic").value),
          categoriasSelecionadas: Array.from(document.querySelectorAll('input[name="categorias"]:checked')).map(checkbox => checkbox.value),
          incluirInformacoes: document.getElementById("info-uteis").checked
      };
  }

  function calcularPrecoBase(valorClassic, incluirInformacoes) {
      if (typeof valorClassic !== 'number' || isNaN(valorClassic) || valorClassic <= 0) {
          alert("Por favor, insira um valor válido para a diária da categoria Classic.");
          return {};
      }

      const valorComfort = valorClassic * 1.2;
      const valorLodge = valorComfort * 1.2;
      const valorLuxoHidro = valorLodge * 1.25;
      const valorPremiumJacuzzi = valorLuxoHidro * 1.15;
      const valorLoftHidro = valorPremiumJacuzzi * 1.3;

      const precosBase = {
          classic: valorClassic,
          comfort: valorComfort,
          lodge: valorLodge,
          luxoHidro: valorLuxoHidro,
          premiumJacuzzi: valorPremiumJacuzzi,
          loftHidro: valorLoftHidro,
      };

      if (incluirInformacoes) {
          precosBase.informacoesUteis = 50.0;
      }

      return precosBase;
  }

  function calcularPrecoTotal(precoBase, categoriasSelecionadas, dataCheckin, dataCheckout) {
      const numeroDias = calcularNumeroDias(dataCheckin, dataCheckout);
      let precoTotal = 0;

      categoriasSelecionadas.forEach(categoria => {
          precoTotal += precoBase[categoria];
      });

      return precoTotal * numeroDias;
  }

  function calcularNumeroDias(dataCheckin, dataCheckout) {
      const dataCheckinObj = new Date(dataCheckin);
      const dataCheckoutObj = new Date(dataCheckout);
      const umDiaEmMilissegundos = 24 * 60 * 60 * 1000;
      const diferencaEmDias = Math.round((dataCheckoutObj - dataCheckinObj) / umDiaEmMilissegundos);
      return diferencaEmDias;
  }

  function gerarTextoOrcamento(dados, precoTotal, precosBase) {
    const numeroDias = calcularNumeroDias(dados.dataCheckin, dados.dataCheckout);

    const categoriasNomes = {
        classic: "Classic",
        comfort: "Comfort",
        lodge: "Lodge",
        luxoHidro: "Luxo Hidro",
        premiumJacuzzi: "Premium Jacuzzi",
        loftHidro: "Loft Hidro"
    };

    let listaPrecos = '';
    dados.categoriasSelecionadas.forEach(categoria => {
        // Verificar se o preço para a categoria existe
        if (precosBase[categoria] !== undefined) {
            listaPrecos += `${categoriasNomes[categoria]}: R$${precosBase[categoria].toFixed(2)} por diária\n`;
        } else {
            console.error(`Preço não encontrado para a categoria: ${categoria}`);
        }
    });

      let informacoesUteis = '';
      if (dados.incluirInformacoes) {
          informacoesUteis = `
              <p>INFORMAÇÕES ÚTEIS:</p>
              <ul>
            <li>Tarifas válidas e confirmação sujeita a disponibilidade.</li>
            <li>Nossas diárias incluem café da manhã e Wi-Fi gratuito.</li>
            <li>Nosso check-in é a partir das 14:00 e check-out até as 12:00 - Para early check-in ou late check-out, por gentileza consultar a recepção disponibilidade e valores.</li>
            <li>01 criança até 07 anos será cortesia acomodada na cama disponível. Não dispomos de camas extras.</li>
            <li>Aceitamos 01 pet em cada quarto, com cobranças adicionais. Favor consultar política de pets. R$ 90,00 dia / pet</li>
            <li>Nossas redes sociais - @moriaecolodge - www.nanohoteis.com.br</li>
            <li>Caso necessite de transfer, poderá entrar em contato direto com nosso parceiro no WhatsApp: 85 3266-6166.</li>
            <li>A voltagem é 220V.</li>
            <li>Não é permitido utilização de caixas de som nas áreas comuns assim como dentro dos quartos em volume que possa incomodar o hóspede vizinho.</li>
          </ul>
  
          <p>Por favor, revise as informações acima com cuidado. Se tudo estiver correto e você deseja prosseguir com a reserva, entre em contato conosco o mais rápido possível para confirmar a sua reserva. Lembre-se de que a disponibilidade está sujeita a alterações, e a sua reserva só será garantida após a confirmação.</p>
  
          <p>Ficamos à disposição para esclarecer quaisquer dúvidas ou fornecer assistência adicional. Estamos ansiosos para recebê-lo em nossa propriedade e garantir que a sua estadia seja agradável.</p>
  
          <p>Atenciosamente,</p>
          <p>Savio Siqueira</p>
          <p>Moria Eco Lodge</p>
          <p>(85) 98109.7155</p>
          <p>reservas.moria@nanohoteis.com.br</p>
          </ul>
          `;
      }

      const texto = `
          <p>Prezado(a) ${dados.nome},</p>
          <p>Conforme solicitado, segue o orçamento para o período de ${dados.dataCheckin} a ${dados.dataCheckout} (${numeroDias} diárias):</p>
          <pre>${listaPrecos}</pre>
          <p>Preço Total: R$${precoTotal.toFixed(2)}</p>
          ${informacoesUteis}
          <p>Atenciosamente,</p>
          <p>Sua Equipe do Moria Eco Lodge</p>
      `;

      return texto;
  }
});