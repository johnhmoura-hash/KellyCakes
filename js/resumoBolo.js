 const storedChoice = sessionStorage.getItem('kelly-cake-choice');
    const choice = storedChoice ? JSON.parse(storedChoice) : null;
    const content = document.querySelector('#summary-content');
    const currency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const escapeHtml = (value = 'Não selecionado') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[character]);

    let cartItem = null;
    if (!choice) {
      content.innerHTML = '<p class="mb-empty-summary">Nenhuma escolha encontrada. <a href="montarBolo.html">Monte seu bolo para ver o resumo.</a></p>';
      document.querySelector('#add-to-cart').disabled = true;
    } else {
      const basePrices = { 1: 120, 2: 220, 3: 320 };
      const decorationPrices = { 'Flores': 20, 'Vintage': 25, 'Romântico': 25, 'Minimalista': 15, 'Luxo': 40, 'Temático': 35 };
      const floors = Number(choice.andares);
      const basePrice = basePrices[floors] || 0;
      const decorationPrice = decorationPrices[choice.decoracao] || 0;
      const totalPrice = basePrice + decorationPrice;
      const cakeDescription = [`${floors} ${floors === 1 ? 'andar' : 'andares'}`];
      Array.from({ length: floors }, (_, index) => choice[`peso-${index + 1}`]).filter(Boolean).forEach((weight, index) => {
        cakeDescription.push(`${index + 1}º andar: ${weight} · ${Number(weight.replace(/\D/g, '')) * 10} fatias`);
      });
      const masses = Array.from({ length: floors }, (_, index) => choice[`massa-${index + 1}`]).filter(Boolean).map((value, index) => `${escapeHtml(value)} (${index + 1}º andar)`);
      const fillings = Array.from({ length: floors }, (_, index) => {
        const first = choice[`recheio-${index + 1}a`];
        const second = choice[`recheio-${index + 1}b`];
        return first || second ? `${index + 1}º andar: ${[first, second].filter(Boolean).map(escapeHtml).join(', ')}` : '';
      }).filter(Boolean);
      const card = (title, description, price = 0) => `<article class="mb-summary-card"><div><h3>${title}</h3><p>${description || 'Não selecionado'}</p></div><strong>${price ? `+ ${currency(price)}` : '+ R$ 0,00'}</strong></article>`;
      const photoCard = choice['foto-modelo'] ? `<article class="mb-summary-card mb-summary-photo"><div><h3>Foto de referência</h3><p>Modelo enviado para a decoração.</p></div><img src="${choice['foto-modelo']}" alt="Foto de referência do bolo"></article>` : '';
      content.innerHTML = [
        card('Bolo', cakeDescription.map(escapeHtml).join('<br>'), basePrice),
        card('Massas', masses.join('<br>')),
        card('Recheios', fillings.join('<br>')),
        card('Cobertura', escapeHtml(choice.cobertura)),
        card('Decoração', escapeHtml(choice.decoracao), decorationPrice),
        photoCard,
        card('Observações', escapeHtml(choice.observacao || 'Nenhuma observação informada.'))
      ].join('');
      document.querySelector('#total-price').textContent = currency(totalPrice);
      cartItem = {
        name: 'Bolo personalizado',
        details: `${floors} ${floors === 1 ? 'andar' : 'andares'} · ${choice.cobertura} · ${choice.decoracao}`,
        price: totalPrice,
        image: choice['foto-modelo'] || ''
      };
    }

    document.querySelector('#add-to-cart').addEventListener('click', () => {
      if (!cartItem) return;
      window.KellyCart.add(cartItem);
      document.querySelector('#cart-message').textContent = 'Bolo adicionado ao carrinho!';
      window.KellyCart.open();
    });