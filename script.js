document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("orcamentoForm");
    const copiarBotao = document.getElementById("copiar-botao");
    
    // Configurar máscaras e eventos
    configurarMascaraTelefone();
    configurarValoresIniciais();
    
    copiarBotao.addEventListener("click", copiarTextoResultado);
    form.addEventListener("submit", processarFormulario);
});

const configurarMascaraTelefone = () => {
    const telefoneInput = document.getElementById("telefone");
    telefoneInput.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/\D/g, "");
        if (valor.length > 11) valor = valor.slice(0, 11);
        
        if (valor.length > 2) {
            valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
        }
        if (valor.length > 9) {
            valor = `${valor.slice(0, 9)}-${valor.slice(9)}`;
        }
        e.target.value = valor;
    });
};

const configurarValoresIniciais = () => {
    // Configurar datas
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    
    const formatarData = (data) => data.toISOString().split('T')[0];
    
    // Definir data mínima e valores padrão
    const checkin = document.getElementById("data-checkin");
    const checkout = document.getElementById("data-checkout");
    
    checkin.min = formatarData(hoje);
    checkout.min = formatarData(hoje);
    
    // Definir valores padrão
    checkin.value = formatarData(hoje);
    checkout.value = formatarData(amanha);
    
    // Valor base para diária Classic
    document.getElementById("valor-classic").value = "650.00";

    // Adicionar evento para mudar para o checkout após selecionar checkin
    checkin.addEventListener('change', () => {
        // Atualiza a data mínima do checkout para ser após o checkin
        const dataCheckin = new Date(checkin.value);
        const novaDataMinima = new Date(dataCheckin);
        novaDataMinima.setDate(dataCheckin.getDate() + 1);
        
        checkout.min = formatarData(novaDataMinima);
        
        // Se a data atual do checkout for menor que a nova data mínima
        if (new Date(checkout.value) <= dataCheckin) {
            checkout.value = formatarData(novaDataMinima);
        }
        
        // Muda o foco para o checkout
        checkout.focus();
        
        // Abre o calendário do checkout automaticamente
        checkout.showPicker();
    });
};

const copiarTextoResultado = () => {
    const resultado = document.getElementById("resultado");
    const inputTemporario = document.createElement("textarea");
    inputTemporario.value = resultado.innerText;
    document.body.appendChild(inputTemporario);
    inputTemporario.select();
    inputTemporario.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(inputTemporario);
    
    // Feedback visual
    const copiarBotao = document.getElementById("copiar-botao");
    copiarBotao.textContent = "Copiado!";
    copiarBotao.style.backgroundColor = "#45a049";
    setTimeout(() => {
        copiarBotao.textContent = "Copiar texto";
        copiarBotao.style.backgroundColor = "#4CAF50";
    }, 2000);
};

const processarFormulario = (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    
    const dadosOrcamento = coletarDadosFormulario();
    const precosBase = calcularPrecoBase(dadosOrcamento.valorClassic);
    const precoTotal = calcularPrecoTotal(precosBase, dadosOrcamento.categoriasSelecionadas, dadosOrcamento.dataCheckin, dadosOrcamento.dataCheckout);
    
    const resultado = document.getElementById("resultado");
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
    
    const categoriasSelecionadas = document.querySelectorAll('input[name="categorias"]:checked');
    if (categoriasSelecionadas.length === 0) {
        alert("Por favor, selecione pelo menos uma categoria de quarto.");
        return false;
    }
    
    return true;
};

const coletarDadosFormulario = () => ({
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    telefone: document.getElementById("telefone").value,
    dataCheckin: document.getElementById("data-checkin").value,
    dataCheckout: document.getElementById("data-checkout").value,
    adultos: parseInt(document.getElementById("adultos").value),
    criancas: parseInt(document.getElementById("criancas").value),
    valorClassic: parseFloat(document.getElementById("valor-classic").value),
    categoriasSelecionadas: Array.from(document.querySelectorAll('input[name="categorias"]:checked')).map(checkbox => checkbox.value),
    incluirInformacoes: document.getElementById("info-uteis").checked,
    temPet: document.getElementById("tem-pet").checked,
    observacoes: document.getElementById("observacoes").value
});

const calcularPrecoBase = (valorClassic) => {
    if (typeof valorClassic !== 'number' || isNaN(valorClassic) || valorClassic <= 0) {
        alert("Por favor, insira um valor válido para a diária da categoria Classic.");
        return {};
    }
    
    return {
        classic: valorClassic,
        comfort: valorClassic * 1.2,
        lodge: valorClassic * 1.44,
        luxoHidro: valorClassic * 1.8,
        premiumJacuzzi: valorClassic * 2.07,
        loftHidro: valorClassic * 2.69
    };
};

const calcularPrecoTotal = (precoBase, categoriasSelecionadas, dataCheckin, dataCheckout) => {
    const numeroDias = calcularNumeroDias(dataCheckin, dataCheckout);
    return categoriasSelecionadas.reduce((total, categoria) => 
        total + (precoBase[categoria] || 0), 0) * numeroDias;
};

const calcularNumeroDias = (dataCheckin, dataCheckout) => {
    const umDiaEmMilissegundos = 86400000;
    return Math.round((new Date(dataCheckout) - new Date(dataCheckin)) / umDiaEmMilissegundos);
};

const gerarTextoOrcamento = (dados, precoTotal, precosBase) => {
    const numeroDias = calcularNumeroDias(dados.dataCheckin, dados.dataCheckout);
    const formatarData = dataString => new Date(dataString).toLocaleDateString('pt-BR');
    const categoriasNomes = {
        classic: "Classic",
        comfort: "Comfort",
        lodge: "Lodge",
        luxoHidro: "Luxo Hidro",
        premiumJacuzzi: "Premium Jacuzzi",
        loftHidro: "Loft Hidro"
    };

    let texto = `Orçamento para ${dados.nome}\n`;
    if (dados.email) texto += `Email: ${dados.email}\n`;
    if (dados.telefone) texto += `Telefone: ${dados.telefone}\n\n`;
    
    texto += `Check-in: ${formatarData(dados.dataCheckin)}\n`;
    texto += `Check-out: ${formatarData(dados.dataCheckout)}\n`;
    texto += `Período: ${numeroDias} ${numeroDias === 1 ? 'diária' : 'diárias'}\n\n`;
    
    texto += `Adultos: ${dados.adultos}\n`;
    texto += `Crianças: ${dados.criancas}\n\n`;
    
    texto += "Valores por categoria:\n";
    dados.categoriasSelecionadas.forEach(categoria => {
        const precoDiaria = precosBase[categoria].toFixed(2);
        const totalCategoria = (precosBase[categoria] * numeroDias).toFixed(2);
        texto += `${categoriasNomes[categoria]}: R$ ${precoDiaria}/diária - Total: R$ ${totalCategoria}\n`;
    });
    
    if (dados.temPet) {
        texto += "\nTaxa de Pet: R$ 90,00 por dia\n";
    }
    
    if (dados.observacoes) {
        texto += `\nObservações:\n${dados.observacoes}\n`;
    }
    
    if (dados.incluirInformacoes) {
        texto += `\nInformações Úteis:
• Check-in: a partir das 14:00
• Check-out: até as 12:00
• Café da manhã incluso
• Wi-Fi gratuito
• 01 criança até 07 anos: cortesia na cama disponível
• Não dispomos de camas extras
• Aceitamos 01 pet por quarto (taxa adicional de R$ 90,00/dia)
• Tarifas sujeitas a alteração sem aviso prévio
• Reserva sujeita a disponibilidade\n`;
    }
    
    return texto;
};

// Funções para controlar os inputs numéricos
function incrementValue(id) {
    const input = document.getElementById(id);
    const max = parseInt(input.getAttribute('max')) || 10;
    const currentValue = parseInt(input.value) || 0;
    if (currentValue < max) {
        input.value = currentValue + 1;
    }
}

function decrementValue(id) {
    const input = document.getElementById(id);
    const min = parseInt(input.getAttribute('min')) || 0;
    const currentValue = parseInt(input.value) || 0;
    if (currentValue > min) {
        input.value = currentValue - 1;
    }
}

// Desabilitar a edição direta do input
document.querySelectorAll('.number-input input').forEach(input => {
    input.addEventListener('keydown', (e) => {
        e.preventDefault();
        return false;
    });
});

// Função para atualizar o orçamento
function atualizarOrcamento() {
    const dadosOrcamento = coletarDadosFormulario();
    const precosBase = calcularPrecoBase(dadosOrcamento.valorClassic);
    const precoTotal = calcularPrecoTotal(precosBase, dadosOrcamento.categoriasSelecionadas, dadosOrcamento.dataCheckin, dadosOrcamento.dataCheckout);
    
    const resultado = document.getElementById("resultado");
    resultado.innerHTML = gerarTextoOrcamento(dadosOrcamento, precoTotal, precosBase);
    resultado.style.display = "block";
}