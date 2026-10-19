
(() => {
    'use strict';

    // =====================================================
    // 1. CONFIGURAÇÕES
    // =====================================================

    const API = 'https://localhost:7229';
    const summary = document.querySelector('#order-summary');

    // =====================================================
    // 2. FUNÇÕES AUXILIARES
    // =====================================================

    function moeda(valor) {
        return Number(valor || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function escaparHTML(valor) {
        return String(valor ?? '').replace(/[&<>"']/g, caractere => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[caractere]);
    }

    function formatarData(data) {
        if (!data) return 'Data não informada';

        const dataFormatada = new Date(data);

        if (Number.isNaN(dataFormatada.getTime())) {
            return String(data);
        }

        return dataFormatada.toLocaleDateString('pt-BR');
    }

    function exibirMensagem(titulo, mensagem, mostrarCatalogo = false) {
        summary.innerHTML = `
            <div class="kc-history-card">
                <div>
                    <h2>${escaparHTML(titulo)}</h2>
                    <p>${escaparHTML(mensagem)}</p>
                </div>

                ${
                    mostrarCatalogo
                        ? `<a class="kc-primary" href="catalogo.html">
                               Ver catálogo
                           </a>`
                        : `<button class="kc-primary"
                                   id="tentar-novamente"
                                   type="button">
                               Tentar novamente
                           </button>`
                }
            </div>
        `;

        document.querySelector('#tentar-novamente')
            ?.addEventListener('click', carregarResumo);
    }

    // =====================================================
    // 3. BUSCAR O PEDIDO NA API
    // =====================================================

    async function carregarResumo() {

        summary.innerHTML = '<p>Carregando os dados do pedido...</p>';

        try {
            /*
             * Esta rota precisa existir no PedidoController.
             * Ela deve retornar o último pedido do usuário
             * autenticado pela sessão do backend.
             */
            const resposta = await fetch(`${API}/Pedido/ultimo`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (resposta.status === 401) {
                location.replace('login.html?next=resumoPedido.html');
                return;
            }

            if (resposta.status === 404) {
                exibirMensagem(
                    'Nenhum pedido encontrado',
                    'Finalize um pedido para visualizar o resumo da sua encomenda.',
                    true
                );
                return;
            }

            if (!resposta.ok) {
                const erro = await resposta.text();
                throw new Error(
                    erro || `Erro ao consultar pedido: ${resposta.status}`
                );
            }

            const pedido = await resposta.json();

            if (!pedido) {
                exibirMensagem(
                    'Nenhum pedido encontrado',
                    'Não encontramos um pedido recente para sua conta.',
                    true
                );
                return;
            }

            renderizarPedido(pedido, user);

        } catch (erro) {
            console.error('Erro ao carregar resumo do pedido:', erro);

            exibirMensagem(
                'Não foi possível carregar o pedido',
                'Verifique se o backend está executando e tente novamente.'
            );
        }
    }

    // =====================================================
    // 4. EXIBIR OS DADOS DO PEDIDO
    // =====================================================

    function renderizarPedido(pedido, user) {
        const idPedido =
            pedido.idPedido ??
            pedido.id_pedido ??
            pedido.id;

        const status =
            pedido.statusPedido ??
            pedido.status_pedido ??
            'Pendente';

        const data =
            pedido.dataPedido ??
            pedido.data_pedido;

        const itens =
            pedido.itens ??
            pedido.items ??
            [];

        const formaPagamento =
            pedido.formaPagamento ??
            pedido.forma_pagamento ??
            '';

        const nomesPagamento = {
            cartao: 'Cartão',
            cartão: 'Cartão',
            pix: 'Pix',
            boleto: 'Boleto bancário'
        };

        // Monta a lista dos bolos.
        const listaItens = itens.map(item => {
            const nome =
                item.nomeBolo ??
                item.nome_bolo ??
                item.nome ??
                item.bolo?.nome ??
                'Bolo personalizado';

            const precoUnitario = Number(
                item.precoUnitario ??
                item.preco_unitario ??
                item.preco ??
                item.bolo?.preco ??
                0
            );

            const quantidade = Number(item.quantidade ?? 1);

            const subtotal = Number(
                item.subtotal ??
                (precoUnitario * quantidade)
            );

            const peso = item.peso ?? item.bolo?.peso;

            const cobertura =
                item.tipoCobertura ??
                item.tipo_cobertura ??
                item.bolo?.tipoCobertura ??
                '';

            const decoracao =
                item.decoracao ??
                item.bolo?.decoracao ??
                '';

            const detalhes = [
                peso ? `${peso} kg` : '',
                cobertura,
                decoracao,
                quantidade > 1 ? `Quantidade: ${quantidade}` : ''
            ].filter(Boolean).join(' · ');

            return {
                subtotal,
                html: `
                    <li>
                        <span>
                            ${escaparHTML(nome)}
                            <small>${escaparHTML(detalhes)}</small>
                        </span>

                        <strong>${moeda(subtotal)}</strong>
                    </li>
                `
            };
        });

        const totalCalculado = listaItens.reduce(
            (soma, item) => soma + item.subtotal,
            0
        );

        const total = Number(
            pedido.total ??
            pedido.valorTotal ??
            pedido.valor_total ??
            totalCalculado
        );

        const itensHTML = listaItens.map(item => item.html).join('');

        const nomeCliente =
            user.name ??
            user.nome ??
            '';

        const emailCliente =
            user.email ??
            user.Email ??
            '';

        const telefoneCliente =
            user.phone ??
            user.telefone ??
            '';

        const pagamentoTexto =
            nomesPagamento[String(formaPagamento).toLowerCase()] ??
            formaPagamento ??
            'Não informado';

        summary.innerHTML = `
            <article class="kc-summary-card">

                <h2>Pedido #${escaparHTML(idPedido ?? '')}</h2>

                <p>
                    ${escaparHTML(formatarData(data))}
                    ·
                    <span class="kc-status andamento">
                        ${escaparHTML(status)}
                    </span>
                </p>

                <h3>Dados do cliente</h3>

                <p>
                    ${escaparHTML(nomeCliente)}<br>
                    ${escaparHTML(emailCliente)}<br>
                    ${escaparHTML(telefoneCliente)}
                </p>

                <h3>Bolos do pedido</h3>

                ${
                    itens.length > 0
                        ? `<ul class="kc-order-items">${itensHTML}</ul>`
                        : '<p>Não foram encontrados itens neste pedido.</p>'
                }

                <div class="kc-total">
                    Total
                    <strong>${moeda(total)}</strong>
                </div>

                <div class="kc-payment-result">
                    <h3>Forma de pagamento</h3>
                    <p>${escaparHTML(pagamentoTexto)}</p>
                    <p>
                        Status do pedido: ${escaparHTML(status)}.
                    </p>
                </div>

                <a class="kc-primary" href="historicoPedidos.html">
                    Ver histórico de pedidos
                </a>

                <a href="portfolio.html">
                    Voltar para a loja
                </a>

            </article>
        `;
    }

    // =====================================================
    // 5. INICIALIZAÇÃO
    // =====================================================

    if (summary) {
        carregarResumo();
    } else {
        console.error(
            'Elemento #order-summary não encontrado no HTML.'
        );
    }
})();
