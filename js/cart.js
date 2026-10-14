
(() => {
  const API = 'https://localhost:7229';
  const currency = value =>
    Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>'"]/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#039;',
      '"': '&quot;'
    })[character]);

  document.body.insertAdjacentHTML('beforeend', `
        <div class="kc-cart-backdrop" aria-hidden="true"></div>

        <aside class="kc-cart-drawer"
               aria-label="Carrinho de compras"
               aria-hidden="true"> 

            <div class="kc-cart-heading">
                <h2>Seu carrinho</h2>
                <button class="kc-cart-close"
                        type="button"
                        aria-label="Fechar carrinho">×</button>
            </div>

            <div class="kc-cart-items">
                <p>Carregando carrinho...</p>
            </div>

            <div class="kc-cart-total">
                <span>Total</span>
                <strong>R$ 0,00</strong>
            </div>

            <a class="kc-order-history"
               href="historicoPedidos.html" hidden>
                Ver histórico de pedidos
            </a>

            <button class="kc-checkout" type="button" disabled>
                Finalizar pedido
            </button>
        </aside>
    `);

  const drawer = document.querySelector('.kc-cart-drawer');
  const backdrop = document.querySelector('.kc-cart-backdrop');
  const itemArea = document.querySelector('.kc-cart-items');
  const totalElement = document.querySelector('.kc-cart-total strong');
  const checkout = document.querySelector('.kc-checkout');
  const orderHistory = document.querySelector('.kc-order-history');

  let itensCarrinho = [];
  let carregando = false;

  async function requisicao(url, options = {}) {
    const response = await fetch(`${API}${url}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? {
          'Content-Type': 'application/json'
        } : {}),
        ...options.headers
      }
    });

    const texto = await response.text();
    let dados = null;

    try {
      dados = texto ? JSON.parse(texto) : null;
    } catch {
      dados = texto;
    }

    if (!response.ok) {
      const mensagem =
        typeof dados === 'string'
          ? dados
          : dados?.mensagem ||
          dados?.message ||
          dados?.title ||
          'Não foi possível concluir a operação.';

      throw new Error(mensagem);
    }

    return dados;
  }

  function normalizarItem(item) {
    const bolo = item.bolo || item.Bolo || item;
    const id = item.idItemCarrinho
      ?? item.IdItemCarrinho
      ?? item.id
      ?? item.Id;

    const quantidade = Number(
      item.quantidade ?? item.Quantidade ?? 1
    );

    const preco = Number(
      item.preco
      ?? item.Preco
      ?? bolo.preco
      ?? bolo.Preco
      ?? 0
    );

    const subtotal = Number(
      item.subtotal
      ?? item.Subtotal
      ?? preco * quantidade
    );

    const cobertura =
      bolo.tipoCobertura ?? bolo.TipoCobertura ?? '';

    const decoracao =
      bolo.decoracao ?? bolo.Decoracao ?? '';

    const peso = bolo.peso ?? bolo.Peso;

    const detalhes = [
      peso ? `${peso} kg` : '',
      cobertura,
      decoracao
    ].filter(Boolean).join(' • ');

    return {
      id,
      quantidade,
      preco,
      subtotal,
      nome: item.nome ?? item.Nome ?? `Bolo personalizado`,
      detalhes,
      foto: bolo.fotoReferencia ?? bolo.FotoReferencia ?? bolo.foto ?? bolo.Foto ?? ''
    };
  }

  async function carregarCarrinho() {
    if (carregando) return;

    carregando = true;
    itemArea.innerHTML = '<p>Carregando carrinho...</p>';
    checkout.disabled = true;

    try {
      const resposta = await requisicao('/Carrinho');

      const lista = Array.isArray(resposta)
        ? resposta
        : resposta?.itens
        ?? resposta?.Itens
        ?? resposta?.items
        ?? resposta?.Items
        ?? [];

      itensCarrinho = lista.map(normalizarItem);
      render();
    } catch (erro) {
      itensCarrinho = [];

      itemArea.innerHTML = `
                <p class="kc-cart-empty">
                    ${escapeHtml(erro.message)}
                </p>
                <button class="kc-cart-retry" type="button">
                    Tentar novamente
                </button>
            `;

      totalElement.textContent = currency(0);
      checkout.disabled = true;
    } finally {
      carregando = false;
    }
  }

  function render() {
    if (!itensCarrinho.length) {
      itemArea.innerHTML = `
                <p class="kc-cart-empty">
                    Seu carrinho ainda está vazio.
                    <a href="login.html">Fazer pedido</a>
                </p>
            `;
    } else {
      itemArea.innerHTML = itensCarrinho.map(item => {
        const foto = item.image || item.fotoReferencia || item.foto || '';

        const image = foto
          ? `<img src="${foto.startsWith('http') ? foto : `https://localhost:7229/${foto.replace(/^\/+/, '')}`}"
         alt="Foto de referência do bolo"
         onerror="this.style.display='none'">`
          : '';

        return `
                    <article class="kc-cart-item">
                        ${imagem}

                        <div class="kc-cart-item__info">
                            <h3>${escapeHtml(item.nome)}</h3>
                            <p>${escapeHtml(item.detalhes)}</p>
                            <p>Quantidade: ${item.quantidade}</p>
                            <p>Unitário: ${currency(item.preco)}</p>
                        </div>

                        <strong>${currency(item.subtotal)}</strong>

                        <button
                            class="kc-cart-remove"
                            type="button"
                            data-id="${escapeHtml(item.id ?? '')}"
                            ${item.id == null ? 'disabled' : ''}>
                            Remover
                        </button>
                    </article>
                `;
      }).join('');
    }

    const total = itensCarrinho.reduce(
      (soma, item) => soma + item.subtotal,
      0
    );

    totalElement.textContent = currency(total);
    checkout.disabled = itensCarrinho.length === 0;

    orderHistory.hidden = !window.KellyAuth?.getUser();
  }

  async function removerItem(id) {
    if (id === '' || id == null) {
      alert('Não foi possível identificar este item.');
      return;
    }

    try {
      await requisicao(
        `/Carrinho/remover/${encodeURIComponent(id)}`,
        { method: 'DELETE' }
      );

      await carregarCarrinho();
    } catch (erro) {
      alert(erro.message);
    }
  }

  function abrir() {
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    carregarCarrinho();
  }

  function fechar() {
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  document.querySelector('.kc-cart-close')
    .addEventListener('click', fechar);

  backdrop.addEventListener('click', fechar);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') fechar();
  });

  document.addEventListener('click', event => {
    const link = event.target.closest('.carrinho, .mb-cart');

    if (link) {
      event.preventDefault();
      abrir();
    }
  });

  itemArea.addEventListener('click', event => {
    const retry = event.target.closest('.kc-cart-retry');

    if (retry) {
      carregarCarrinho();
      return;
    }

    const botao = event.target.closest('.kc-cart-remove');

    if (botao) {
      removerItem(botao.dataset.id);
    }
  });

  checkout.addEventListener('click', () => {
    if (!itensCarrinho.length) return;

    if (!window.KellyAuth?.getUser()) {
      alert('Entre na sua conta para finalizar o pedido.');
      location.href =
        'login.html?next=confirmarBolo.html';
      return;
    }

    location.href = 'confirmarBolo.html';
  });

  // Atualiza o carrinho depois de adicionar um bolo.
  // O bolo precisa já estar cadastrado no banco e ter um ID.
  window.KellyCart = {
    abrir,
    open: abrir,
    render: carregarCarrinho,

    async add(item) {
      const idBolo =
        item?.idBolo ??
        item?.IdBolo ??
        item?.id ??
        item?.Id;

      if (!idBolo) {
        throw new Error(
          'O bolo precisa estar salvo no banco antes de ser adicionado.'
        );
      }

      await requisicao(
        `/Carrinho/adicionar?idBolo=${encodeURIComponent(idBolo)}`,
        { method: 'POST' }
      );

      await carregarCarrinho();
    }
  };

  render();
})();
