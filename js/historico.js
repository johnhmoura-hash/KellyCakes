
(() => {
    const API = 'https://localhost:7229';
    const list = document.querySelector('#history-list');

    function escapeHtml(valor) {
        return String(valor ?? '').replace(/[&<>"']/g, caractere => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[caractere]);
    }

    function formatarMoeda(valor) {
        return Number(valor || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function formatarData(data) {
        if (!data) return '';
        const parte = String(data).substring(0, 10);
        const [ano, mes, dia] = parte.split('-');
        return ano && mes && dia ? `${dia}/${mes}/${ano}` : parte;
    }

    function renderPagamento(pedido) {
        const forma = String(pedido.formaPagamento || '').toLowerCase();

        if (forma === 'pix' && pedido.codigoPix) {
            return `
                <div class="kc-payment-detail">
                    <h3>Pix demonstrativo</h3>
                    <p>
                        Este código é fictício e serve apenas para a
                        apresentação acadêmica. Não é possível realizar
                        pagamentos com ele.
                    </p>

                    <textarea
                        class="kc-pix-code"
                        readonly
                        rows="3"
                        aria-label="Código Pix demonstrativo"
                    >${escapeHtml(pedido.codigoPix)}</textarea>

                    <button type="button" class="kc-primary kc-copy-pix">
                        Copiar código
                    </button>
                </div>
            `;
        }

        if (forma === 'boleto' && pedido.boletoPdfUrl) {
            return `
                <div class="kc-payment-detail">
                    <h3>Boleto demonstrativo</h3>
                    <p>
                        PDF de demonstração acadêmica, sem valor de cobrança.
                    </p>
                    <a
                        class="kc-primary"
                        href="${escapeHtml(pedido.boletoPdfUrl)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Baixar boleto em PDF
                    </a>
                </div>
            `;
        }

        if (forma === 'pix' || forma === 'boleto') {
            return `
                <div class="kc-payment-detail">
                    <p>Os dados demonstrativos deste pagamento não estão disponíveis.</p>
                </div>
            `;
        }

        return `
            <p>Forma de pagamento: ${escapeHtml(pedido.formaPagamento || 'Não informada')}</p>
        `;
    }

    async function carregarHistorico() {
        const user = window.KellyAuth?.getUser();

        if (!user) {
            location.replace(
                'login.html?next=historicoPedidos.html'
            );
            return;
        }

        list.innerHTML = '<p>Carregando seus pedidos...</p>';

        try {
            const resposta = await fetch(`${API}/Pedido/historico`, {
                method: 'GET',
                credentials: 'include'
            });

            if (resposta.status === 401) {
                location.replace(
                    'login.html?next=historicoPedidos.html'
                );
                return;
            }

            if (!resposta.ok) {
                throw new Error('Não foi possível consultar os pedidos.');
            }

            const pedidos = await resposta.json();

            if (!pedidos.length) {
                list.innerHTML = `
                    <div class="kc-history-card">
                        <div>
                            <h2>Você ainda não fez pedidos</h2>
                            <p>
                                Quando finalizar uma encomenda, ela aparecerá aqui.
                            </p>
                        </div>
                        <a class="kc-primary" href="catalogo.html">
                            Ver catálogo
                        </a>
                    </div>
                `;
                return;
            }

            list.innerHTML = pedidos.map(pedido => {
                const itens = Array.isArray(pedido.itens)
                    ? pedido.itens
                    : [];

                return `
                    <article class="kc-history-card">
                        <div class="kc-history-content">
                            <h2>Pedido #${escapeHtml(pedido.idPedido)}</h2>

                            <p>Data: ${escapeHtml(formatarData(pedido.data))}</p>
                            <p>Status: ${escapeHtml(pedido.status || 'Pendente')}</p>
                            <p>Total: ${escapeHtml(formatarMoeda(pedido.total))}</p>
                            <p>Itens: ${itens.reduce(
                                (soma, item) => soma + Number(item.quantidade || 0),
                                0
                            )}</p>

                            ${renderPagamento(pedido)}
                        </div>
                    </article>
                `;
            }).join('');

            list.querySelectorAll('.kc-copy-pix').forEach(botao => {
                botao.addEventListener('click', async () => {
                    const campo = botao
                        .closest('.kc-payment-detail')
                        .querySelector('.kc-pix-code');

                    try {
                        await navigator.clipboard.writeText(campo.value);
                        botao.textContent = 'Código copiado!';
                    } catch (erro) {
                        campo.focus();
                        campo.select();

                        const copiado = document.execCommand('copy');

                        botao.textContent = copiado
                            ? 'Código copiado!'
                            : 'Copie o código selecionado';
                    }
                });
            });

        } catch (erro) {
            console.error(erro);

            list.innerHTML = `
                <div class="kc-history-card">
                    <div>
                        <h2>Não foi possível carregar o histórico</h2>
                        <p>Verifique se o backend está em execução.</p>
                    </div>
                    <button type="button" class="kc-primary" id="tentar-historico">
                        Tentar novamente
                    </button>
                </div>
            `;

            document.querySelector('#tentar-historico')
                ?.addEventListener('click', carregarHistorico);
        }
    }

    carregarHistorico();
})();
