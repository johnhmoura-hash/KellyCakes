(() => {
  if (!KellyStaffAuth.getUser()) { location.replace('funcionario-login.html'); return; }
  const orderKey = 'kelly-cakes-orders', catalogKey = 'kelly-cakes-catalog';
  const statuses = ['Recebido', 'Em produção', 'Pronto para retirada', 'Finalizado', 'Cancelado'];
  const cls = (status) => ({ 'Pronto para retirada':'pronto', Finalizado:'finalizado', Cancelado:'cancelado' }[status] || 'andamento');
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));
  const escape = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' })[c]);
  const money = (value) => Number(value).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  document.querySelector('#staff-name').textContent = `Olá, ${KellyStaffAuth.getUser().name}. Gerencie o atendimento da loja.`;
  function renderOrders() {
    const orders = read(orderKey), target = document.querySelector('#staff-orders');
    document.querySelector('#orders-count').textContent = `${orders.length} pedido${orders.length === 1 ? '' : 's'}`;
    target.innerHTML = orders.length ? orders.map((order) => `<article class="kc-order-card"><div><span class="kc-order-id">#${escape(order.id)}</span><h3>${escape(order.name)}</h3><p><strong>${escape(order.customerName || order.email || 'Cliente não informado')}</strong> · ${escape(order.email || '')}</p><p>${escape(order.date || '')}${order.pickupDate ? ` · Retirada: ${escape(order.pickupDate)}` : ''}</p>${order.notes ? `<p class="kc-order-notes">${escape(order.notes)}</p>` : ''}</div><div class="kc-order-actions"><label>Status<select data-order-id="${escape(order.id)}">${statuses.map((status) => `<option ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></label><span class="kc-status ${cls(order.status)}">${escape(order.status || 'Recebido')}</span></div></article>`).join('') : '<div class="kc-empty-state">Ainda não há pedidos registrados.</div>';
  }
  function renderCatalog() {
    const items = read(catalogKey), target = document.querySelector('#staff-catalog');
    target.innerHTML = items.length ? items.map((item) => `<article class="kc-catalog-card"><img src="${item.image}" alt="${escape(item.title)}"><h2>${escape(item.title)}</h2><p>${escape(item.description)}</p><small>${item.price ? `A partir de ${money(item.price)}` : 'Preço sob consulta'}</small><button class="kc-danger" data-remove-catalog="${escape(item.id)}">Remover do catálogo</button></article>`).join('') : '<div class="kc-empty-state">Os modelos padrão continuam no catálogo. Adicione itens extras aqui.</div>';
  }
  document.querySelector('#staff-orders').addEventListener('change', (event) => { if (!event.target.matches('[data-order-id]')) return; const orders = read(orderKey), order = orders.find((item) => item.id === event.target.dataset.orderId); if (!order) return; order.status = event.target.value; order.statusClass = cls(order.status); save(orderKey, orders); renderOrders(); });
  document.querySelector('#new-order-form').addEventListener('submit', (event) => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)), orders = read(orderKey); orders.unshift({ id:String(Date.now()).slice(-6), customerName:data.customerName, email:data.email, phone:data.phone, name:data.name, total:Number(data.total), pickupDate:data.pickupDate, notes:data.notes, date:new Date().toLocaleDateString('pt-BR'), status:data.status, statusClass:cls(data.status), items:[] }); save(orderKey, orders); event.currentTarget.reset(); renderOrders(); document.querySelector('[data-tab="orders"]').click(); });
  document.querySelector('#catalog-form').addEventListener('submit', (event) => { event.preventDefault(); const form = event.currentTarget, data = Object.fromEntries(new FormData(form)), file = form.elements.photo.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { const items = read(catalogKey); items.unshift({ id:String(Date.now()), title:data.title, description:data.description, price:data.price, image:reader.result, model:'personalizado' }); save(catalogKey, items); form.reset(); renderCatalog(); }; reader.readAsDataURL(file); });
  document.querySelector('#staff-catalog').addEventListener('click', (event) => { const button = event.target.closest('[data-remove-catalog]'); if (!button) return; save(catalogKey, read(catalogKey).filter((item) => item.id !== button.dataset.removeCatalog)); renderCatalog(); });
  document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('[data-tab], .kc-staff-section').forEach((item) => item.classList.remove('is-active')); button.classList.add('is-active'); document.querySelector(`#${button.dataset.tab}`).classList.add('is-active'); }));
  document.querySelector('#staff-logout').addEventListener('click', () => { KellyStaffAuth.logout(); location.href = 'funcionario-login.html'; });
  renderOrders(); renderCatalog();
})();
