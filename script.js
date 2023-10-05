document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("orcamento-form");
    const resultado = document.getElementById("resultado");

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

        const precosBase = calcularPrecoBase(valorClassic);
        const precoTotal = calcularPrecoTotal(precosBase, categoriasSelecionadas, dataCheckin, dataCheckout);

        const textoOrcamento = gerarTextoOrcamento(nome, categoriasSelecionadas, dataCheckin, dataCheckout, adultos, criancas, valorClassic, precoTotal, precosBase);

        // Exibir o texto na div resultado com formatação HTML
        resultado.innerHTML = textoOrcamento;
        resultado.style.display = "block"; // Mostrar a div resultado
    });

    // Função para calcular o preço base com base na diária da categoria Classic
    function calcularPrecoBase(valorClassic) {
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

        return {
            classic: valorClassic,
            comfort: valorComfort,
            lodge: valorLodge,
            luxoHidro: valorLuxoHidro,
            premiumJacuzzi: valorPremiumJacuzzi,
            loftHidro: valorLoftHidro
        };
    }
    // funcao para 
    function setMinDate() {
        const checkinDate = new Date(document.getElementById("data-checkin").value);
        const checkoutInput = document.getElementById("data-checkout");
        const minDate = new Date(checkinDate);
        minDate.setDate(checkinDate.getDate() + 1); // Defina o mínimo como um dia após o check-in
        checkoutInput.min = minDate.toISOString().split("T")[0];
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

    // Função para gerar o texto do orçamento
    function gerarTextoOrcamento(nome, categoriasSelecionadas, dataCheckin, dataCheckout, adultos, criancas, valorClassic, precoTotal, precosBase) {
        const numeroDias = calcularNumeroDias(dataCheckin, dataCheckout);

        // Construir a lista de preços para todas as categorias selecionadas
        let listaPrecos = '';
        categoriasSelecionadas.forEach(categoria => {
            listaPrecos += `<li>${categoria}: R$${precosBase[categoria].toFixed(2)}</li>`;
        });

        const texto = `
            <p>Prezado(a) ${nome},</p>

            <p>Agradecemos por escolher o nosso hotel para a sua estadia. Abaixo, você encontrará o orçamento para a sua reserva:</p>

            <ul>
                <li>Categorias do Quarto: ${categoriasSelecionadas.join(", ")}</li>
                <li>Check-in: ${dataCheckin}</li>
                <li>Check-out: ${dataCheckout}</li>
                <li>Número de Adultos: ${adultos}</li>
                <li>Número de Crianças: ${criancas}</li>
            </ul>

            <p>Detalhes do Orçamento:</p>

            <ul>
                <li>Preço Base da Categoria Classic: R$${valorClassic.toFixed(2)}</li>
                <li>Preços por Categoria:</li>
                <ul>
                    ${listaPrecos}
                </ul>
                <li>Número de Dias da Estadia: ${numeroDias}</li>
                <li>Preço Total da Estadia: R$${precoTotal.toFixed(2)}</li>
            </ul>

            <p>Total a Pagar: R$${precoTotal.toFixed(2)}</p>

            <p>Observações:</p>

            <ul>
                <li>Os preços podem estar sujeitos a impostos e taxas adicionais.</li>
                <li>Qualquer serviço adicional, como alimentação e estacionamento, não está incluído no orçamento.</li>
                <li>Certifique-se de ler e aceitar nossos termos e políticas de cancelamento.</li>
            </ul>

            <p>Por favor, revise as informações acima com cuidado. Se tudo estiver correto e você deseja prosseguir com a reserva, entre em contato conosco o mais rápido possível para confirmar a sua reserva. Lembre-se de que a disponibilidade está sujeita a alterações, e a sua reserva só será garantida após a confirmação.</p>

            <p>Ficamos à disposição para esclarecer quaisquer dúvidas ou fornecer assistência adicional. Estamos ansiosos para recebê-lo em nossa propriedade e garantir que a sua estadia seja agradável.</p>

            <p>Atenciosamente,</p>
            <p>[Seu Nome]</p>
            <p>[Nome do Hotel]</p>
            <p>[Telefone de Contato]</p>
            <p>[Endereço de E-mail de Contato]</p>
        `;

        return texto;
    }
});
