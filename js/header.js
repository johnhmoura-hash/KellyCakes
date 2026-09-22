(() => {
  const markup = `<header class="kc-header"><div class="kc-header__inner"><a class="kc-header__brand" href="portfolio.html" aria-label="Kelly Cakes - página inicial"><img src="img/logoHeader.png" alt="Kelly Cakes"></a><button class="kc-header__toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="kc-main-menu"><span></span><span></span><span></span></button><nav id="kc-main-menu" class="kc-header__nav" aria-label="Navegação principal"><a href="portfolio.html#sabores">Como montar?</a><a href="portfolio.html#pedido">Como pedir</a><a href="portfolio.html#contato">Contato</a><a href="catalogo.html">Catálogo</a><a class="kc-header__cta" href="montarBolo.html">Fazer pedido</a><a class="kc-header__cart carrinho mb-cart" href="carrinho.html" aria-label="Abrir carrinho"><i class="bi bi-cart"></i><span>Carrinho</span></a></nav></div></header>`;
  const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = 'css/header.css'; document.head.append(style);
  let template = markup;
  try { const request = new XMLHttpRequest(); request.open('GET', 'components/header.html', false); request.send(); if (request.status >= 200 && request.status < 300) template = request.responseText; } catch { /* o HTML embutido mantém o componente funcionando ao abrir o arquivo diretamente */ }
  const mount = document.querySelector('[data-kc-header]');
  const oldHeader = document.querySelector('body > header');
  if (mount) mount.outerHTML = template;
  else if (oldHeader) oldHeader.outerHTML = template;
  else return;
  const toggle = document.querySelector('.kc-header__toggle'), menu = document.querySelector('.kc-header__nav');
  toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') === 'true'; toggle.setAttribute('aria-expanded', String(!open)); toggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu'); menu.classList.toggle('is-open', !open); });
  menu.addEventListener('click', (event) => { if (!event.target.closest('a')) return; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menu'); menu.classList.remove('is-open'); });
})();
