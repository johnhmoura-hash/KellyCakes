(() => {
  const user = KellyAuth.getUser();
  if (!user) { location.replace('login.html?next=confirmarBolo.html'); return; }
  document.querySelector('[data-client-name]').textContent = user.name;
  document.querySelector('[data-client-email]').textContent = user.email;
  document.querySelector('[data-client-phone]').textContent = user.phone || 'Telefone não informado';
  document.querySelector('.btn-continuar').addEventListener('click', () => {
    const cart = JSON.parse(sessionStorage.getItem('kelly-cakes-cart') || '[]');
    if (!cart.length) { alert('Seu carrinho está vazio. Adicione um bolo para continuar.'); location.href = 'catalogo.html'; return; }
    const orders = JSON.parse(localStorage.getItem('kelly-cakes-orders') || '[]');
    const item = cart[0];
    orders.unshift({ id: String(Date.now()).slice(-6), email: user.email, name: item.name, date: new Date().toLocaleDateString('pt-BR'), status: 'Em andamento', statusClass: 'andamento' });
    localStorage.setItem('kelly-cakes-orders', JSON.stringify(orders));
    sessionStorage.removeItem('kelly-cakes-cart');
    location.href = 'historicoPedidos.html';
  });
})();
