(() => {
  const userKey = 'kelly-cakes-user';
  const read = () => {
    try { return JSON.parse(localStorage.getItem(userKey) || 'null'); } catch { return null; }
  };
  const save = (user) => localStorage.setItem(userKey, JSON.stringify(user));
  const logout = () => localStorage.removeItem(userKey);
  window.KellyAuth = { getUser: read, save, logout };
  document.querySelectorAll('a[href="#catalogo"]').forEach((link) => { link.href = 'catalogo.html'; });
})();
