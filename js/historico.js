(() => {
  const user = KellyAuth.getUser();
  if (!user) { location.replace('login.html?next=historicoPedidos.html'); return; }
  const orders = JSON.parse(localStorage.getItem('kelly-cakes-orders') || '[]').filter((order) => order.email === user.email);
  const list = document.querySelector('#history-list');
  list.innerHTML = orders.length ? orders.map((order) => `<article class="kc-history-card"><div><h2>${order.name}</h2><p>Pedido #${order.id} · ${order.date}</p></div><span class="kc-status ${order.statusClass}">${order.status}</span></article>`).join('') : '<div class="kc-history-card"><div><h2>Você ainda não fez pedidos</h2><p>Quando finalizar uma encomenda, ela aparecerá aqui.</p></div><a class="kc-primary" href="catalogo.html">Ver catálogo</a></div>';
})();
