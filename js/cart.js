(() => {
  const storageKey = 'kelly-cakes-cart';
  const currency = (value) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' })[character]);
  const getCart = () => JSON.parse(sessionStorage.getItem(storageKey) || '[]');
  const saveCart = (items) => sessionStorage.setItem(storageKey, JSON.stringify(items));

  document.body.insertAdjacentHTML('beforeend', `
    <div class="kc-cart-backdrop" aria-hidden="true"></div>
    <aside class="kc-cart-drawer" aria-label="Carrinho de compras" aria-hidden="true">
      <div class="kc-cart-heading"><h2>Seu carrinho</h2><button class="kc-cart-close" type="button" aria-label="Fechar carrinho">×</button></div>
      <div class="kc-cart-items"></div>
      <div class="kc-cart-total"><span>Total</span><strong>R$ 0,00</strong></div>
      <a class="kc-order-history" href="historicoPedidos.html" hidden>Ver histórico de pedidos</a>
      <button class="kc-checkout" type="button">Finalizar pedido</button>
    </aside>`);

  const drawer = document.querySelector('.kc-cart-drawer');
  const backdrop = document.querySelector('.kc-cart-backdrop');
  const itemArea = document.querySelector('.kc-cart-items');
  const total = document.querySelector('.kc-cart-total strong');
  const checkout = document.querySelector('.kc-checkout');
  const orderHistory = document.querySelector('.kc-order-history');
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.kc-checkout')) return;
    event.stopImmediatePropagation();
    if (!window.KellyAuth?.getUser()) {
      alert('Para finalizar seu pedido, você precisa entrar ou criar uma conta.');
      location.href = 'login.html?next=confirmarBolo.html';
      return;
    }
    location.href = 'confirmarBolo.html';
  }, true);
  const close = () => { drawer.classList.remove('is-open'); backdrop.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); };
  const open = () => { render(); drawer.classList.add('is-open'); backdrop.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); };

  function render() {
    const items = getCart();
    itemArea.innerHTML = items.length ? items.map((item, index) => {
      const image = typeof item.image === 'string' && item.image.startsWith('data:image/') ? `<img src="${item.image}" alt="Foto de referência do bolo">` : '';
      return `<article class="kc-cart-item">${image}<div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.details)}</p></div><strong>${currency(item.price)}</strong><button class="kc-cart-remove" type="button" data-index="${index}">Remover</button></article>`;
    }).join('') : '<p class="kc-cart-empty">Seu carrinho ainda está vazio.</p>';
    total.textContent = currency(items.reduce((sum, item) => sum + Number(item.price), 0));
    checkout.disabled = !items.length;
    orderHistory.hidden = !window.KellyAuth?.getUser();
  }

  itemArea.addEventListener('click', (event) => {
    const button = event.target.closest('.kc-cart-remove');
    if (!button) return;
    const items = getCart();
    items.splice(Number(button.dataset.index), 1);
    saveCart(items);
    render();
  });
  document.querySelector('.kc-cart-close').addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  document.querySelectorAll('.carrinho, .mb-cart').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); open(); }));
  checkout.addEventListener('click', () => alert('Pedido pronto para finalização.'));
  window.KellyCart = { add(item) { saveCart([...getCart(), item]); }, open, render };
  render();
})();
