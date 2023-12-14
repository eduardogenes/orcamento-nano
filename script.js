document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("orcamento-form");
    const copiarBotao = document.getElementById("copiar-botao");
    copiarBotao.addEventListener("click", copiarTextoResultado);
    form.addEventListener("submit", processarFormulario);
});

const copiarTextoResultado = () => {
    const resultado = document.getElementById("resultado");
    const inputTemporario = document.createElement("textarea");
    inputTemporario.value = resultado.innerText;
    document.body.appendChild(inputTemporario);
    inputTemporario.select();
    inputTemporario.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(inputTemporario);
    alert("Texto copiado para a área de transferência!");
};

const processarFormulario = (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    const dadosOrcamento = coletarDadosFormulario();
    const precosBase = calcularPrecoBase(dadosOrcamento.valorClassic, dadosOrcamento.incluirInformacoes);
    const precoTotal = calcularPrecoTotal(precosBase, dadosOrcamento.categoriasSelecionadas, dadosOrcamento.dataCheckin, dadosOrcamento.dataCheckout);
    resultado.innerHTML = gerarTextoOrcamento(dadosOrcamento, precoTotal, precosBase);
    resultado.style.display = "block";
};

const validarFormulario = () => {
    const dataCheckin = new Date(document.getElementById("data-checkin").value);
    const dataCheckout = new Date(document.getElementById("data-checkout").value);
    if (dataCheckin >= dataCheckout) {
        alert("A data de check-out deve ser posterior à data de check-in.");
        return false;
    }
    return true;
};

const coletarDadosFormulario = () => ({
    nome: document.getElementById("nome").value,
    dataCheckin: document.getElementById("data-checkin").value,
    dataCheckout: document.getElementById("data-checkout").value,
    adultos: parseInt(document.getElementById("adultos").value),
    criancas: parseInt(document.getElementById("criancas").value),
    valorClassic: parseFloat(document.getElementById("valor-classic").value),
    categoriasSelecionadas: Array.from(document.querySelectorAll('input[name="categorias"]:checked')).map(checkbox => checkbox.value),
    incluirInformacoes: document.getElementById("info-uteis").checked
});

const calcularPrecoBase = (valorClassic, incluirInformacoes) => {
    if (typeof valorClassic !== 'number' || isNaN(valorClassic) || valorClassic <= 0) {
        alert("Por favor, insira um valor válido para a diária da categoria Classic.");
        return {};
    }
    const precosBase = {
        classic: valorClassic,
        comfort: valorClassic * 1.2,
        lodge: valorClassic * 1.44,
        luxoHidro: valorClassic * 1.8,
        premiumJacuzzi: valorClassic * 2.07,
        loftHidro: valorClassic * 2.69
    };
    if (incluirInformacoes) precosBase.informacoesUteis = 50.0;
    return precosBase;
};

const calcularPrecoTotal = (precoBase, categoriasSelecionadas, dataCheckin, dataCheckout) => {
    const numeroDias = calcularNumeroDias(dataCheckin, dataCheckout);
    return categoriasSelecionadas.reduce((total, categoria) => total + (precoBase[categoria] || 0), 0) * numeroDias;
};

const calcularNumeroDias = (dataCheckin, dataCheckout) => {
    const umDiaEmMilissegundos = 86400000; // 24 * 60 * 60 * 1000
    return Math.round((new Date(dataCheckout) - new Date(dataCheckin)) / umDiaEmMilissegundos);
};

const gerarTextoOrcamento = (dados, precoTotal, precosBase) => {
    const numeroDias = calcularNumeroDias(dados.dataCheckin, dados.dataCheckout);
    const formatarData = dataString => new Date(dataString).toLocaleDateString('pt-BR');
    const categoriasNomes = { classic: "Classic", comfort: "Comfort", lodge: "Lodge", luxoHidro: "Luxo Hidro", premiumJacuzzi: "Premium Jacuzzi", loftHidro: "Loft Hidro" };

    let listaPrecos = dados.categoriasSelecionadas
        .filter(categoria => precosBase[categoria] !== undefined)
        .map(categoria => {
            const precoDiaria = precosBase[categoria].toFixed(2);
            const totalCategoria = (precosBase[categoria] * numeroDias).toFixed(2);
            return `${categoriasNomes[categoria]}: R$ ${precoDiaria}/diária. Total = R$ ${totalCategoria}\n`;
        }).join('');

    const informacoesUteis = dados.incluirInformacoes ? `<p>INFORMAÇÕES ÚTEIS:</p>
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
          <p>(85) 98109.7155</p>
          <p>reservas.moria@nanohoteis.com.br</p>
          <p>Equipe Moria Eco Lodge</p>
          </ul>
          `: '';

          
    return `
        <p>Prezado(a),</p>
        <p>Conforme solicitado, segue o orçamento:<br>
        - Checkin: ${formatarData(dados.dataCheckin)}<br>
        - Checkout: ${formatarData(dados.dataCheckout)}<br>
        - Total de diarias: ${numeroDias}<br>
        - Número de adultos: ${dados.adultos}<br>
        - Número de crianças: ${dados.criancas}</p>
        <pre>${listaPrecos}</pre>
        ${informacoesUteis}
    `;
};