(() => {
  if (!window.KellyStaffAuth?.getUser()) {
    location.replace('funcionario-login.html');
    return;
  }

  const API = 'https://localhost:7229';
  const catalogKey = 'kelly-cakes-catalog';
  const statuses = ['Pendente', 'Em produção', 'Pronto para retirada', 'Finalizado', 'Cancelado'];
  const cls = (status) => ({ 'Pronto para retirada': 'pronto', Finalizado: 'finalizado', Cancelado: 'cancelado' }[status] || 'andamento');
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));
  const escape = (value = '') => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]);
  const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (value) => {
    if (!value) return 'Data não informada';
    const [year, month, day] = String(value).slice(0, 10).split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  };

  document.querySelector('#staff-name').textContent = `Olá, ${KellyStaffAuth.getUser().name}. Gerencie o atendimento da loja.`;

  function renderOrders(orders) {
    const target = document.querySelector('#staff-orders');
    document.querySelector('#orders-count').textContent = `${orders.length} pedido${orders.length === 1 ? '' : 's'}`;
    target.innerHTML = orders.length ? orders.map((order) => {
      const customer = order.cliente || {};
      const items = Array.isArray(order.itens) ? order.itens : [];
      return `<article class="kc-order-card">
        <div class="kc-order-main">
          <span class="kc-order-id">Pedido #${escape(order.idPedido)}</span>
          <h3>${escape(customer.nome || 'Cliente não identificado')}</h3>
          <p>${escape(customer.email || 'E-mail não informado')} · ${escape(customer.telefone || 'Telefone não informado')}</p>
          ${customer.cpf ? `<p>CPF: ${escape(customer.cpf)}</p>` : ''}
          <p>Data: ${escape(formatDate(order.data))} · Pagamento: ${escape(order.formaPagamento || 'Não informado')}</p>
          <div class="kc-order-items-block"><strong>Itens do pedido</strong>
            ${items.length ? `<ul>${items.map(item => `<li><span>${escape(item.nome || 'Bolo personalizado')} × ${escape(item.quantidade)}${item.peso ? ` · ${escape(item.peso)} kg` : ''}${item.tipoCobertura ? ` · ${escape(item.tipoCobertura)}` : ''}${item.decoracao ? ` · ${escape(item.decoracao)}` : ''}${item.observacao ? `<small>${escape(item.observacao)}</small>` : ''}</span><strong>${money(item.subtotal)}</strong></li>`).join('')}</ul>` : '<p>Este pedido não possui itens detalhados.</p>'}
            <p class="kc-order-total"><strong>Total</strong><strong>${money(order.total)}</strong></p>
          </div>
        </div>
        <div class="kc-order-actions"><label>Status<select data-order-id="${escape(order.idPedido)}" data-previous="${escape(order.status || 'Pendente')}">${statuses.map(status => `<option value="${escape(status)}" ${String(order.status).toLowerCase() === status.toLowerCase() ? 'selected' : ''}>${escape(status)}</option>`).join('')}</select></label><span class="kc-status ${cls(order.status)}">${escape(order.status || 'Pendente')}</span><small data-status-message="${escape(order.idPedido)}" aria-live="polite"></small></div>
      </article>`;
    }).join('') : '<div class="kc-empty-state">Ainda não há pedidos registrados.</div>';
  }

  async function loadOrders() {
    const target = document.querySelector('#staff-orders');
    target.innerHTML = '<div class="kc-empty-state">Carregando pedidos...</div>';
    try {
      const response = await fetch(`${API}/Pedido/equipe`, { credentials: 'include' });
      if (!response.ok) throw new Error('Não foi possível consultar os pedidos.');
      renderOrders(await response.json());
    } catch (error) {
      console.error(error);
      target.innerHTML = '<div class="kc-empty-state"><strong>Não foi possível carregar os pedidos.</strong><p>Confira se o backend está em execução e tente novamente.</p><button type="button" class="kc-secondary" id="retry-orders">Tentar novamente</button></div>';
      target.querySelector('#retry-orders')?.addEventListener('click', loadOrders);
    }
  }

  async function updateStatus(select) {
    const id = select.dataset.orderId;
    const message = document.querySelector(`[data-status-message="${CSS.escape(id)}"]`);
    const previous = select.dataset.previous || select.value;
    select.disabled = true;
    if (message) message.textContent = 'Salvando...';
    try {
      const response = await fetch(`${API}/Pedido/${encodeURIComponent(id)}/status`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: select.value })
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.mensagem || 'Não foi possível atualizar o status.');
      }
      select.dataset.previous = select.value;
      const badge = select.closest('.kc-order-actions').querySelector('.kc-status');
      badge.textContent = select.value;
      badge.className = `kc-status ${cls(select.value)}`;
      if (message) message.textContent = 'Status atualizado.';
    } catch (error) {
      select.value = previous;
      if (message) message.textContent = error.message;
    } finally { select.disabled = false; }
  }

  function renderCatalog() {
    const items = read(catalogKey), target = document.querySelector('#staff-catalog');
    target.innerHTML = items.length ? items.map(item => `<article class="kc-catalog-card"><img src="${escape(item.image)}" alt="${escape(item.title)}"><h2>${escape(item.title)}</h2><p>${escape(item.description)}</p><small>${item.price ? `A partir de ${money(item.price)}` : 'Preço sob consulta'}</small><button class="kc-danger" data-remove-catalog="${escape(item.id)}">Remover do catálogo</button></article>`).join('') : '<div class="kc-empty-state">Os modelos padrão continuam no catálogo. Adicione itens extras aqui.</div>';
  }

  document.querySelector('#staff-orders').addEventListener('change', event => {
    if (!event.target.matches('[data-order-id]')) return;
    updateStatus(event.target);
  });
  document.querySelector('#new-order-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const orders = read('kelly-cakes-orders');
    orders.unshift({ id: String(Date.now()).slice(-6), ...data, date: new Date().toLocaleDateString('pt-BR'), status: data.status, items: [] });
    save('kelly-cakes-orders', orders);
    event.currentTarget.reset();
    document.querySelector('[data-tab="orders"]').click();
    loadOrders();
  });
  document.querySelector('#catalog-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget, data = Object.fromEntries(new FormData(form)), file = form.elements.photo.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { const items = read(catalogKey); items.unshift({ id: String(Date.now()), title: data.title, description: data.description, price: data.price, image: reader.result, model: 'personalizado' }); save(catalogKey, items); form.reset(); renderCatalog(); };
    reader.readAsDataURL(file);
  });
  document.querySelector('#staff-catalog').addEventListener('click', event => {
    const button = event.target.closest('[data-remove-catalog]');
    if (!button) return;
    save(catalogKey, read(catalogKey).filter(item => item.id !== button.dataset.removeCatalog));
    renderCatalog();
  });
  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-tab], .kc-staff-section').forEach(item => item.classList.remove('is-active'));
    button.classList.add('is-active');
    document.querySelector(`#${button.dataset.tab}`).classList.add('is-active');
  }));
  document.querySelector('#staff-logout').addEventListener('click', () => { KellyStaffAuth.logout(); location.href = 'funcionario-login.html'; });
  loadOrders();
  renderCatalog();
})();
