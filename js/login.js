(() => {
  const form = document.querySelector('#login-form');
  const message = document.querySelector('#auth-message');
  const next = new URLSearchParams(location.search).get('next') || 'portfolio.html';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const accounts = JSON.parse(localStorage.getItem('kelly-cakes-accounts') || '[]');
    const account = accounts.find((item) => item.email.toLowerCase() === data.email.toLowerCase() && item.password === data.password);
    if (!account) { message.textContent = 'E-mail ou senha não encontrados. Cadastre-se para continuar.'; return; }
    KellyAuth.save({ name: account.name, email: account.email, phone: account.phone || '' });
    location.href = next;
  });
})();
