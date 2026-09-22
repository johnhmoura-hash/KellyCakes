(() => {
  const user = KellyAuth.getUser();
  if (!user) { location.replace('login.html?next=resumoPedido.html'); return; }
  const order = JSON.parse(sessionStorage.getItem('kelly-cakes-last-order') || 'null');
  const summary = document.querySelector('#order-summary');
  if (!order || order.email !== user.email) { summary.innerHTML = '<div class="kc-history-card"><div><h2>Nenhum pedido recente</h2><p>Finalize um pedido para ver o resumo aqui.</p></div><a class="kc-primary" href="catalogo.html">Ver catálogo</a></div>'; return; }
  const currency = (value) => Number(value).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  const total = order.items.reduce((sum, item) => sum + Number(item.price), 0);
  const items = order.items.map((item) => `<li><span>${item.name}<small>${item.details}</small></span><strong>${currency(item.price)}</strong></li>`).join('');
  let paymentInfo = '';
  if (order.payment.method === 'pix') paymentInfo = '<div class="kc-payment-result"><h3>Pix</h3><p>Use a chave abaixo para realizar o pagamento:</p><code id="pix-key">pix@kellycakes.com.br</code><button id="copy-pix" type="button">Copiar chave Pix</button></div>';
  if (order.payment.method === 'boleto') paymentInfo = `<div class="kc-payment-result kc-boleto"><h3>Boleto bancário</h3><p>Vencimento em 2 dias úteis. Use a opção abaixo para salvar como PDF ou imprimir.</p><button id="print-boleto" type="button">Imprimir boleto / salvar PDF</button><p class="kc-barcode">00190.00009 01234.567891 23456.789012 3 123400000${total.toFixed(2).replace('.', '')}</p></div>`;
  if (order.payment.method === 'cartao') paymentInfo = `<div class="kc-payment-result"><h3>Cartão</h3><p>${order.payment.label} · ${order.payment.installments}</p></div>`;
  summary.innerHTML = `<article class="kc-summary-card"><h2>Pedido #${order.id}</h2><p>${order.date} · <span class="kc-status andamento">Em andamento</span></p><h3>Cliente</h3><p>${user.name}<br>${user.email}<br>${user.phone || ''}</p><h3>Bolos</h3><ul class="kc-order-items">${items}</ul><div class="kc-total">Total <strong>${currency(total)}</strong></div>${paymentInfo}<a class="kc-primary" href="historicoPedidos.html">Ver histórico de pedidos</a></article>`;
  document.querySelector('#copy-pix')?.addEventListener('click', async (event) => {
    const key = 'pix@kellycakes.com.br';
    try { await navigator.clipboard.writeText(key); }
    catch {
      const input = document.createElement('textarea');
      input.value = key; document.body.append(input); input.select(); document.execCommand('copy'); input.remove();
    }
    event.target.textContent = 'Chave Pix copiada!';
  });
  document.querySelector('#print-boleto')?.addEventListener('click', () => window.print());
})();
