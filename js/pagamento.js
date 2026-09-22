(() => {
  const user = KellyAuth.getUser();
  if (!user) return;
  const extra = document.querySelector('#payment-extra');
  const cardsKey = 'kelly-cakes-cards';
  const cards = () => JSON.parse(localStorage.getItem(cardsKey) || '[]').filter((card) => card.email === user.email);
  const selectedMethod = () => document.querySelector('input[name="pagamento"]:checked').value;

  const renderCardForm = () => {
    const saved = cards();
    const savedCards = saved.length ? `<div class="saved-cards"><h3>Cartões usados anteriormente</h3>${saved.map((card, index) => `<label><input type="radio" name="saved-card" value="${index}" ${index === 0 ? 'checked' : ''}> ${card.brand} final ${card.last4}</label>`).join('')}</div><button class="add-card-link" type="button">Adicionar outro cartão</button>` : '';
    extra.innerHTML = `<div class="payment-detail">${savedCards}<form id="card-form" ${saved.length ? 'hidden' : ''}><h3>${saved.length ? 'Adicionar cartão' : 'Adicione seu cartão'}</h3><label>Nome no cartão<input name="holder" required autocomplete="cc-name"></label><label>Número do cartão<input name="number" inputmode="numeric" pattern="[0-9 ]{13,23}" placeholder="0000 0000 0000 0000" required autocomplete="cc-number"></label><div class="payment-fields"><label>Validade<input name="expiry" placeholder="MM/AA" pattern="(0[1-9]|1[0-2])/[0-9]{2}" required autocomplete="cc-exp"></label><label>CVV<input name="cvv" inputmode="numeric" pattern="[0-9]{3,4}" required autocomplete="cc-csc"></label></div><label>Parcelamento<select name="installments"><option value="1x sem juros">1x sem juros</option><option value="2x sem juros">2x sem juros</option><option value="3x sem juros">3x sem juros</option><option value="6x com juros">6x com juros</option><option value="12x com juros">12x com juros</option></select></label></form><div class="saved-installments" ${saved.length ? '' : 'hidden'}><label>Parcelamento<select name="saved-installments"><option value="1x sem juros">1x sem juros</option><option value="2x sem juros">2x sem juros</option><option value="3x sem juros">3x sem juros</option><option value="6x com juros">6x com juros</option><option value="12x com juros">12x com juros</option></select></label></div></div>`;
    extra.querySelector('.add-card-link')?.addEventListener('click', () => { extra.querySelector('#card-form').hidden = false; extra.querySelector('.saved-installments').hidden = true; });
  };
  const render = () => {
    const method = selectedMethod();
    if (method === 'cartao') { renderCardForm(); return; }
    extra.innerHTML = method === 'pix' ? '<div class="payment-detail"><h3>Pagamento via Pix</h3><p>A chave Pix será exibida no resumo final do pedido.</p></div>' : '<div class="payment-detail"><h3>Pagamento via boleto</h3><p>O boleto para impressão será disponibilizado no resumo final do pedido.</p></div>';
  };
  document.querySelectorAll('input[name="pagamento"]').forEach((input) => input.addEventListener('change', render));
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.btn-continuar')) return;
    event.stopImmediatePropagation();
    const cart = JSON.parse(sessionStorage.getItem('kelly-cakes-cart') || '[]');
    if (!cart.length) { alert('Seu carrinho está vazio.'); location.href = 'catalogo.html'; return; }
    const method = selectedMethod();
    let payment = { method, label: method === 'pix' ? 'Pix' : 'Boleto bancário' };
    if (method === 'cartao') {
      const form = extra.querySelector('#card-form');
      const isAdding = !form.hidden;
      if (isAdding && !form.reportValidity()) return;
      if (isAdding) {
        const data = Object.fromEntries(new FormData(form));
        const digits = data.number.replace(/\D/g, '');
        const allCards = JSON.parse(localStorage.getItem(cardsKey) || '[]');
        allCards.push({ email: user.email, brand: digits.startsWith('4') ? 'Visa' : 'Cartão', last4: digits.slice(-4) });
        localStorage.setItem(cardsKey, JSON.stringify(allCards));
        payment = { method, label: `Cartão final ${digits.slice(-4)}`, installments: data.installments };
      } else {
        const selected = cards()[Number(extra.querySelector('input[name="saved-card"]:checked').value)];
        payment = { method, label: `${selected.brand} final ${selected.last4}`, installments: extra.querySelector('[name="saved-installments"]').value };
      }
    }
    const order = { id: String(Date.now()).slice(-6), email: user.email, name: cart.map((item) => item.name).join(', '), items: cart, date: new Date().toLocaleDateString('pt-BR'), status: 'Em andamento', statusClass: 'andamento', payment };
    const orders = JSON.parse(localStorage.getItem('kelly-cakes-orders') || '[]');
    orders.unshift(order); localStorage.setItem('kelly-cakes-orders', JSON.stringify(orders));
    sessionStorage.setItem('kelly-cakes-last-order', JSON.stringify(order));
    sessionStorage.removeItem('kelly-cakes-cart');
    location.href = 'resumoPedido.html';
  }, true);
  render();
})();
