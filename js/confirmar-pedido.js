
(() => {
    // =====================================================
    // 1. VERIFICAR USUÁRIO
    // =====================================================

    const user = window.KellyAuth?.getUser();

    if (!user) {
        location.replace('login.html?next=confirmarBolo.html');
        return;
    }

    const API = 'https://localhost:7229';

    // =====================================================
    // 2. PREENCHER DADOS DO CLIENTE
    // =====================================================

    document.querySelector('[data-client-name]').textContent =
        user.name || user.nome || '';

    document.querySelector('[data-client-email]').textContent =
        user.email || user.Email || '';

    document.querySelector('[data-client-phone]').textContent =
        user.phone || user.telefone || 'Telefone não informado';

    const extra = document.querySelector('#payment-extra');

    // =====================================================
    // 3. CARREGAR CARTÕES CADASTRADOS NO PERFIL
    // =====================================================

    async function renderCardForm() {
        extra.innerHTML = '<p>Carregando cartões...</p>';

        try {
            const resposta = await fetch(
                `${API}/api/cartoes/meus-cartoes`,
                { credentials: 'include' }
            );

            if (!resposta.ok) {
                throw new Error('Erro ao buscar cartões.');
            }

            const cartoes = await resposta.json();

            extra.innerHTML = `
                <div class="payment-detail">
                    <h3>Escolha um cartão</h3>

                    <div class="saved-cards">
                        ${
                            cartoes.length
                                ? cartoes.map((cartao, index) => `
                                    <label class="saved-card-option">
                                        <input
                                            type="radio"
                                            name="saved-card"
                                            value="${cartao.id}"
                                            ${index === 0 ? 'checked' : ''}
                                        >

                                        <span>
                                            <strong>${escapeHtml(cartao.bandeira)}</strong>
                                            <span>•••• ${escapeHtml(cartao.ultimos4)}</span>
                                            <small>${escapeHtml(cartao.nomeCartao)}</small>
                                        </span>
                                    </label>
                                `).join('')
                                : '<p>Você ainda não tem cartões cadastrados.</p>'
                        }
                    </div>

                    <button type="button" id="btn-novo-cartao"
                            class="add-card-link">
                        + Cadastrar novo cartão
                    </button>

                    <form id="card-form" hidden>
                        <h3>Novo cartão</h3>

                        <label>
                            Nome no cartão
                            <input name="holder" required autocomplete="cc-name">
                        </label>

                        <label>
                            Número do cartão
                            <input name="number" required
                                   inputmode="numeric"
                                   autocomplete="cc-number"
                                   maxlength="23"
                                   placeholder="0000 0000 0000 0000">
                        </label>

                        <div class="payment-fields">
                            <label>
                                Validade
                                <input name="expiry" required
                                       placeholder="MM/AA"
                                       pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                                       autocomplete="cc-exp">
                            </label>

                            <label>
                                CVV
                                <input name="cvv" required
                                       inputmode="numeric"
                                       pattern="[0-9]{3,4}"
                                       maxlength="4"
                                       autocomplete="cc-csc">
                            </label>
                        </div>

                        <button type="submit" class="add-card-link">
                            Salvar cartão
                        </button>
                    </form>
                </div>
            `;

            const form = extra.querySelector('#card-form');

            extra.querySelector('#btn-novo-cartao')
                .addEventListener('click', () => {
                    form.hidden = false;
                    form.querySelector('[name="holder"]').focus();
                });

            form.addEventListener('submit', async (event) => {
                event.preventDefault();

                if (!form.reportValidity()) return;

                const dados = new FormData(form);
                const numero = String(dados.get('number')).replace(/\D/g, '');
                const validade = String(dados.get('expiry'));
                const [mes, ano] = validade.split('/');

                if (numero.length < 13 || numero.length > 19) {
                    alert('Confira o número do cartão.');
                    return;
                }

                const bandeira = numero.startsWith('4')
                    ? 'Visa'
                    : numero.startsWith('5')
                        ? 'Mastercard'
                        : 'Outro';

                const novoCartao = {
                    NomeCartao: dados.get('holder'),
                    NumCartao: numero,
                    Bandeira: bandeira,
                    DtaVencimento: `20${ano}-${mes}-01`,
                    Codigo: ''
                };

                try {
                    const salvar = await fetch(
                        `${API}/api/cartoes/cadastrar`,
                        {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(novoCartao)
                        }
                    );

                    if (!salvar.ok) {
                        throw new Error(await salvar.text());
                    }

                    alert('Cartão cadastrado com sucesso!');
                    await renderCardForm();

                } catch (erro) {
                    console.error(erro);
                    alert(
                        'Não foi possível cadastrar o cartão. ' +
                        'Verifique a API e o modelo Cartao.'
                    );
                }
            });

        } catch (erro) {
            console.error(erro);

            extra.innerHTML = `
                <p>Não foi possível carregar os cartões.</p>
                <button type="button" id="tentar-cartoes">
                    Tentar novamente
                </button>
            `;

            extra.querySelector('#tentar-cartoes')
                .addEventListener('click', renderCardForm);
        }
    }

    function escapeHtml(valor) {
        return String(valor ?? '').replace(/[&<>'"]/g, caractere => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#039;',
            '"': '&quot;'
        })[caractere]);
    }

    // =====================================================
    // 4. EXIBIR CAMPOS CONFORME O PAGAMENTO
    // =====================================================

    function renderPagamento() {
        const selecionado = document.querySelector(
            'input[name="pagamento"]:checked'
        );

        if (!selecionado) return;

        if (selecionado.value === 'cartao') {
            renderCardForm();
        } else if (selecionado.value === 'pix') {
            extra.innerHTML = `
                <div class="payment-detail">
                    <h3>Pagamento via Pix</h3>
                    <p>As instruções de pagamento serão exibidas após finalizar.</p>
                </div>
            `;
        } else {
            extra.innerHTML = `
                <div class="payment-detail">
                    <h3>Boleto bancário</h3>
                    <p>As instruções serão exibidas após finalizar.</p>
                </div>
            `;
        }
    }

    document.querySelectorAll('input[name="pagamento"]')
        .forEach(input => input.addEventListener('change', renderPagamento));

    renderPagamento();

    // =====================================================
    // 5. BOTÃO CONTINUAR
    // =====================================================

    document.querySelector('.btn-continuar')
        .addEventListener('click', async () => {
            const cart = JSON.parse(
                sessionStorage.getItem('kelly-cakes-cart') || '[]'
            );

            if (!cart.length) {
                alert('Seu carrinho está vazio.');
                location.href = 'catalogo.html';
                return;
            }

            const pagamento = document.querySelector(
                'input[name="pagamento"]:checked'
            )?.value;

            if (!pagamento) {
                alert('Selecione uma forma de pagamento.');
                return;
            }

            let idCartao = null;

            if (pagamento === 'cartao') {
                const form = extra.querySelector('#card-form');

                // Se o formulário estiver aberto, o cliente ainda
                // precisa salvar o cartão antes de continuar.
                if (form && !form.hidden) {
                    alert('Salve o cartão ou selecione um cartão cadastrado.');
                    return;
                }

                const cartaoSelecionado = extra.querySelector(
                    'input[name="saved-card"]:checked'
                );

                if (!cartaoSelecionado) {
                    alert('Cadastre ou selecione um cartão.');
                    return;
                }

                idCartao = Number(cartaoSelecionado.value);
            }

            // O pedido ainda precisa ser enviado ao backend.
            // Não criar pedido fictício no localStorage.
            try {
                const url = new URL(`${API}/Pedido/finalizar`);
                url.searchParams.set('formaPagamento', pagamento);

                if (idCartao !== null) {
                    url.searchParams.set('idCartao', idCartao);
                }

                const resposta = await fetch(url, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (!resposta.ok) {
                    const mensagem = await resposta.text();
                    throw new Error(mensagem || 'Não foi possível finalizar.');
                }

                // O backend deve retornar os dados do pedido para
                // a tela de resumo/histórico.
                location.href = 'resumoPedido.html';

            } catch (erro) {
                console.error(erro);
                alert(
                    'Não foi possível finalizar o pedido. ' +
                    'Confira a resposta da API.'
                );
            }
        });
})();
