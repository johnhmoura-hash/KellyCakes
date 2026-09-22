(() => {
  const form = document.querySelector('#register-form');
  const message = document.querySelector('#auth-message');
  const next = new URLSearchParams(location.search).get('next') || 'portfolio.html';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const accounts = JSON.parse(localStorage.getItem('kelly-cakes-accounts') || '[]');
    if (accounts.some((item) => item.email.toLowerCase() === data.email.toLowerCase())) { message.textContent = 'Este e-mail já possui cadastro. Faça login.'; return; }
    accounts.push(data);
    localStorage.setItem('kelly-cakes-accounts', JSON.stringify(accounts));
    KellyAuth.save({ name: data.name, email: data.email, phone: data.phone });
    location.href = next;
  });
})();
