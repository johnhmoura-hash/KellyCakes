
// ============================================================
// RESUMO DO BOLO PERSONALIZADO — KELLY CAKES
// ============================================================

// Recupera as escolhas salvas na página montarBolo.html.
// Esses dados devem ser salvos com a chave "kelly-cake-choice".
const storedChoice = sessionStorage.getItem('kelly-cake-choice');

// Converte os dados de JSON para objeto JavaScript.
// Se não houver escolhas salvas, choice será null.
let choice = null;

try {
    choice = storedChoice ? JSON.parse(storedChoice) : null;
} catch (error) {
    console.error('Erro ao recuperar as escolhas do bolo:', error);
}

// Localiza os elementos da página que serão atualizados.
const content = document.querySelector('#summary-content');
const totalPriceElement = document.querySelector('#total-price');
const addToCartButton = document.querySelector('#add-to-cart');
const cartMessage = document.querySelector('#cart-message');

// Formata valores numéricos como moeda brasileira (R$).
const currency = (value) =>
    Number(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

// Evita que textos digitados pelo usuário sejam interpretados
// como HTML ao serem exibidos no resumo.
const escapeHtml = (value = 'Não selecionado') => {
    return String(value).replace(/[&<>'"]/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#039;',
        '"': '&quot;'
    })[character]);
};

// Guarda as informações que serão enviadas ao carrinho.
let cartItem = null;


// ============================================================
// VERIFICA SE EXISTEM ESCOLHAS SALVAS
// ============================================================

if (!choice) {
    // Se o usuário entrar diretamente nesta página sem montar
    // um bolo, mostra uma mensagem e desativa o botão.
    content.innerHTML = `
        <p class="mb-empty-summary">
            Nenhuma escolha encontrada.
            <a href="montarBolo.html">
                Monte seu bolo para ver o resumo.
            </a>
        </p>
    `;

    addToCartButton.disabled = true;

} else {

    // ========================================================
    // PREÇOS
    // ========================================================

    // Preço base de acordo com a quantidade de andares.
    const basePrices = {
        1: 120,
        2: 220,
        3: 320
    };

    // Valor adicional de acordo com a decoração escolhida.
    const decorationPrices = {
        'Flores': 20,
        'Vintage': 25,
        'Romântico': 25,
        'Minimalista': 15,
        'Luxo': 40,
        'Temático': 35
    };

    // Quantidade de andares escolhida.
    const floors = Number(choice.andares);

    // Impede que um valor inválido gere um preço incorreto.
    const validFloors = [1, 2, 3].includes(floors);

    // Calcula o preço base e o adicional da decoração.
    const basePrice = validFloors ? basePrices[floors] : 0;
    const decorationPrice = decorationPrices[choice.decoracao] || 0;

    // Soma os valores para obter o total do bolo.
    const totalPrice = basePrice + decorationPrice;


    // ========================================================
    // INFORMAÇÕES DO BOLO
    // ========================================================

    // Começa a descrição com a quantidade de andares.
    const cakeDescription = [
        `${floors} ${floors === 1 ? 'andar' : 'andares'}`
    ];

    // Recupera o peso de cada andar e calcula uma estimativa
    // de fatias: 10 fatias por kg, conforme a regra anterior.
    for (let index = 1; index <= floors; index++) {
        const weight = choice[`peso-${index}`];

        // Ignora campos vazios ou sem uma opção válida.
        if (!weight || weight === 'Selecione') {
            continue;
        }

        // Extrai o número do peso, por exemplo, "2 kg" vira 2.
        const kg = Number(String(weight).replace(',', '.').replace(/[^\d.]/g, ''));

        // Só mostra a estimativa quando o peso é válido.
        const slices = Number.isFinite(kg) ? kg * 10 : 0;

        cakeDescription.push(
            `${index}º andar: ${escapeHtml(weight)} · ${slices} fatias (estimativa)`
        );
    }


    // ========================================================
    // MASSAS
    // ========================================================

    // Recupera a massa selecionada para cada andar.
    const masses = [];

    for (let index = 1; index <= floors; index++) {
        const mass = choice[`massa-${index}`];

        if (mass && mass !== 'Selecione') {
            masses.push(
                `${index}º andar: ${escapeHtml(mass)}`
            );
        }
    }


    // ========================================================
    // RECHEIOS
    // ========================================================

    // Cada andar pode ter dois recheios: A e B.
    const fillings = [];

    for (let index = 1; index <= floors; index++) {
        const first = choice[`recheio-${index}a`];
        const second = choice[`recheio-${index}b`];

        // Mantém somente os recheios selecionados.
        const selectedFillings = [first, second].filter(
            (filling) => filling && filling !== 'Selecione'
        );

        // Adiciona o andar ao resumo se houver algum recheio.
        if (selectedFillings.length > 0) {
            fillings.push(
                `${index}º andar: ${selectedFillings.map(escapeHtml).join(', ')}`
            );
        }
    }


    // ========================================================
    // FUNÇÃO PARA CRIAR OS CARDS DO RESUMO
    // ========================================================

    // Cria um card com título, descrição e valor adicional.
    // O texto da descrição já deve estar protegido com escapeHtml.
    const card = (title, description, price = 0) => `
        <article class="mb-summary-card">
            <div>
                <h3>${title}</h3>
                <p>${description || 'Não selecionado'}</p>
            </div>

            <strong>
                ${price > 0 ? `+ ${currency(price)}` : '+ R$ 0,00'}
            </strong>
        </article>
    `;


    // ========================================================
    // FOTO DE REFERÊNCIA
    // ========================================================

    // Mostra a foto somente se houver uma imagem salva.
    // A imagem deve ser a prévia salva pela página de montagem.
    const photoCard = choice['foto-modelo']
        ? `
            <article class="mb-summary-card mb-summary-photo">
                <div>
                    <h3>Foto de referência</h3>
                    <p>Modelo enviado para a decoração.</p>
                </div>

                <img
                    src="${escapeHtml(choice['foto-modelo'])}"
                    alt="Foto de referência do bolo"
                >
            </article>
        `
        : '';


    // ========================================================
    // EXIBE TODAS AS INFORMAÇÕES NA PÁGINA
    // ========================================================

    content.innerHTML = [
        // Quantidade de andares e pesos.
        card(
            'Bolo',
            cakeDescription.join('<br>'),
            basePrice
        ),

        // Massas selecionadas.
        card(
            'Massas',
            masses.join('<br>')
        ),

        // Recheios selecionados.
        card(
            'Recheios',
            fillings.join('<br>')
        ),

        // Cobertura escolhida.
        card(
            'Cobertura',
            escapeHtml(choice.cobertura)
        ),

        // Decoração e seu valor adicional.
        card(
            'Decoração',
            escapeHtml(choice.decoracao),
            decorationPrice
        ),

        // Foto de referência, se houver.
        photoCard,

        // Observações adicionais.
        card(
            'Observações',
            escapeHtml(
                choice.observacao || 'Nenhuma observação informada.'
            )
        )
    ].join('');


    // ========================================================
    // MOSTRA O VALOR TOTAL
    // ========================================================

    // Atualiza o valor total apresentado na página.
    totalPriceElement.textContent = currency(totalPrice);


    // ========================================================
    // PREPARA O ITEM PARA O CARRINHO
    // ========================================================

    // Monta o objeto que será usado pela função KellyCart.add().
    cartItem = {
        name: 'Bolo personalizado',

        // Resumo curto mostrado no carrinho.
        details: [
            `${floors} ${floors === 1 ? 'andar' : 'andares'}`,
            choice.cobertura || 'Cobertura não selecionada',
            choice.decoracao || 'Decoração não selecionada'
        ].join(' · '),

        // Preço total calculado nesta página.
        price: totalPrice,

        // Foto de referência, caso tenha sido selecionada.
        image: choice['foto-modelo'] || '',

        // ID do bolo criado pelo backend, se estiver disponível.
        idBolo: choice.idBolo || sessionStorage.getItem('kelly-bolo-id')
    };
}


// ============================================================
// BOTÃO "ADICIONAR AO CARRINHO"
// ============================================================

    addToCartButton.addEventListener('click', async (event) => {
    // Impede qualquer comportamento padrão do botão.
    event.preventDefault();

    // Não permite continuar se não houver um bolo selecionado.
    if (!cartItem) {
        cartMessage.textContent = 'Nenhum bolo foi encontrado.';
        return;
    }

    // Recupera o ID do bolo criado anteriormente pela API.
    const idBolo = cartItem.idBolo;

    // O backend precisa do ID para encontrar o bolo no banco.
    if (!idBolo || !Number.isInteger(Number(idBolo))) {
        cartMessage.textContent =
            'Não foi possível identificar seu bolo. Monte-o novamente.';
        console.error('ID do bolo inválido:', idBolo);
        return;
    }

    // Evita cliques repetidos enquanto a requisição está em andamento.
    addToCartButton.disabled = true;
    cartMessage.textContent = 'Adicionando bolo ao carrinho...';

    try {
        // Envia o ID do bolo para o CarrinhoController.
        // credentials: 'include' envia o cookie da sessão do usuário.
        const response = await fetch(
            `https://localhost:7229/Carrinho/adicionar?idBolo=${encodeURIComponent(idBolo)}`,
            {
                method: 'POST',
                credentials: 'include'
            }
        );

        // Trata erros retornados pelo backend.
        if (!response.ok) {
            const erro = await response.text();

            if (response.status === 401) {
                cartMessage.textContent =
                    'Faça login para adicionar o bolo ao carrinho.';
            } else if (response.status === 404) {
                cartMessage.textContent =
                    'O bolo não foi encontrado no banco de dados.';
            } else {
                cartMessage.textContent =
                    'Não foi possível adicionar o bolo ao carrinho.';
            }

            console.error('Erro ao adicionar ao carrinho:', erro);
            return;
        }

        // Lê a confirmação enviada pelo CarrinhoController.
        const resultado = await response.json();

        // Confirma que o item foi salvo no banco.
        cartMessage.textContent =
            resultado.mensagem || 'Bolo adicionado ao carrinho!';

        console.log('Resposta do carrinho:', resultado);

        // Se houver uma página de carrinho no projeto,
        // o usuário poderá acessá-la pelo botão ou menu do site.

    } catch (error) {
        // Captura falhas de conexão, certificado HTTPS ou CORS.
        console.error('Erro de comunicação com a API:', error);

        cartMessage.textContent =
            'Não foi possível conectar ao servidor. Tente novamente.';
    } finally {
        // Libera o botão novamente, mesmo se ocorrer um erro.
        addToCartButton.disabled = false;
    }
})

