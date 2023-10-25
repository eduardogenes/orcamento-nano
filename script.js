document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("orcamento-form");
    const resultado = document.getElementById("resultado");
    const mostrarInformacoes = document.getElementById("info-uteis");
  
    form.addEventListener("submit", function (e) {
      e.preventDefault();
  
      const nome = document.getElementById("nome").value;
      const dataCheckin = document.getElementById("data-checkin").value;
      const dataCheckout = document.getElementById("data-checkout").value;
      const adultos = parseInt(document.getElementById("adultos").value);
      const criancas = parseInt(document.getElementById("criancas").value);
      const valorClassic = parseFloat(document.getElementById("valor-classic").value);
  
      // Coletar categorias selecionadas
      const categoriasSelecionadas = [];
      const categoriasCheckboxes = document.querySelectorAll('input[name="categorias"]:checked');
      categoriasCheckboxes.forEach(checkbox => {
        categoriasSelecionadas.push(checkbox.value);
      });
  
      // Verificar se o usuário selecionou pelo menos uma categoria
      if (categoriasSelecionadas.length === 0) {
        alert("Por favor, selecione pelo menos uma categoria de quarto.");
        return;
      }
  
      const incluirInformacoes = mostrarInformacoes.checked;
      const precosBase = calcularPrecoBase(valorClassic, incluirInformacoes);
      const precoTotal = calcularPrecoTotal(precosBase, categoriasSelecionadas, dataCheckin, dataCheckout);
  
      const textoOrcamento = gerarTextoOrcamento(nome, categoriasSelecionadas, dataCheckin, dataCheckout, adultos, criancas, valorClassic, precoTotal, precosBase, incluirInformacoes);
  
      // Exibir o texto na div resultado com formatação HTML
      resultado.innerHTML = textoOrcamento;
      resultado.style.display = "block"; // Mostrar a div resultado
    });
  
    // Função para calcular o preço base com base na diária da categoria Classic
    function calcularPrecoBase(valorClassic, incluirInformacoes) {
      // Certifique-se de que valorClassic seja um número válido
      if (typeof valorClassic !== 'number' || isNaN(valorClassic) || valorClassic <= 0) {
        alert("Por favor, insira um valor válido para a diária da categoria Classic.");
        return {}; // Retorna um objeto vazio em caso de erro
      }
  
      // Calcular preços base para outras categorias com base no valorClassic
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
        // Adicione os preços das informações úteis
        precosBase.informacoesUteis = 50.0; // Atualize o valor conforme necessário
      }
  
      return precosBase;
    }
  
    // Função para calcular o preço total com base no preço base, categorias e datas de check-in e check-out
    function calcularPrecoTotal(precoBase, categoriasSelecionadas, dataCheckin, dataCheckout) {
      const numeroDias = calcularNumeroDias(dataCheckin, dataCheckout);
      let precoTotal = 0;
  
      // Calcular o preço total somando os preços das categorias selecionadas
      categoriasSelecionadas.forEach(categoria => {
        precoTotal += precoBase[categoria];
      });
  
      return precoTotal * numeroDias;
    }
  
    // Função para calcular o número de dias com base nas datas de check-in e check-out
    function calcularNumeroDias(dataCheckin, dataCheckout) {
      const dataCheckinObj = new Date(dataCheckin);
      const dataCheckoutObj = new Date(dataCheckout);
      const umDiaEmMilissegundos = 24 * 60 * 60 * 1000; // Um dia em milissegundos
      const diferencaEmDias = Math.round((dataCheckoutObj - dataCheckinObj) / umDiaEmMilissegundos);
      return diferencaEmDias;
    }
  
    function gerarTextoOrcamento(nome, categoriasSelecionadas, dataCheckin, dataCheckout, adultos, criancas, valorClassic, precoTotal, precosBase, incluirInformacoes) {
      const numeroDias = calcularNumeroDias(dataCheckin, dataCheckout);
  
      // Mapear os valores das categorias selecionadas para nomes completos
      const categoriasNomes = categoriasSelecionadas.map(function(categoria) {
        switch (categoria) {
          case "classic":
            return "Classic";
          case "comfort":
            return "Comfort";
          case "lodge":
            return "Lodge";
          case "luxoHidro":
            return "Luxo Hidro";
          case "premiumJacuzzi":
            return "Premium Jacuzzi";
          case "loftHidro":
            return "Loft Hidro";
          default:
            return categoria;
        }
      });
  
      // Construir a lista de preços por categoria
      let listaPrecos = '';
      categoriasSelecionadas.forEach((categoria, index) => {
        listaPrecos += `${categoriasNomes[index]} R$${precosBase[categoria].toFixed(2)} por diária\n`;
      });
  
      // Construir o texto das informações úteis se a opção estiver marcada
      let informacoesUteis = '';
      if (incluirInformacoes) {
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
        `;
      }
  
      // Retornar o texto do orçamento completo
      const texto = `
        <p>Prezado(a) ${nome},</p>
  
        <p>Conforme solicitado, segue orçamento por categoria:</p>
        <p>Período: ${dataCheckin} a ${dataCheckout} - ${numeroDias} diárias</p>
        <p>Valores por diária com café da manhã incluso</p>
        <pre>
        ${listaPrecos}
        </pre>
  
        ${informacoesUteis}
      `;
  
      return texto;
    }
  });
  