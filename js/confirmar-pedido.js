(() => {
    // =====================================================
    // 1. VERIFICAR USUÁRIO
    // =====================================================

    const user = KellyAuth.getUser();

    if (!user) {
        location.replace('login.html?next=confirmarBolo.html');
        return;
    }

    // =====================================================
    // 2. PREENCHER DADOS DO CLIENTE
    // =====================================================

    document.querySelector('[data-client-name]').textContent =
        user.name;

    document.querySelector('[data-client-email]').textContent =
        user.email;

    document.querySelector('[data-client-phone]').textContent =
        user.phone || 'Telefone não informado';

    // =====================================================
    // 3. CONFIGURAR BOTÃO CONTINUAR
    // =====================================================

    document.querySelector('.btn-continuar').addEventListener('click', () => {

        // -------------------------------------------------
        // 3.1. VERIFICAR CARRINHO
        // -------------------------------------------------

        const cart = JSON.parse(
            sessionStorage.getItem('kelly-cakes-cart') || '[]'
        );

        if (!cart.length) {
            alert('Seu carrinho está vazio. Adicione um bolo para continuar.');

            location.href = 'catalogo.html';
            return;
        }

        // -------------------------------------------------
        // 3.2. RECUPERAR PEDIDOS EXISTENTES
        // -------------------------------------------------

        const orders = JSON.parse(
            localStorage.getItem('kelly-cakes-orders') || '[]'
        );

        // -------------------------------------------------
        // 3.3. PREPARAR NOVO PEDIDO
        // -------------------------------------------------

        const item = cart[0];

        const order = {
            id: String(Date.now()).slice(-6),
            email: user.email,
            name: item.name,
            date: new Date().toLocaleDateString('pt-BR'),
            status: 'Em andamento',
            statusClass: 'andamento'
        };

        // -------------------------------------------------
        // 3.4. SALVAR PEDIDO
        // -------------------------------------------------

        orders.unshift(order);

        localStorage.setItem(
            'kelly-cakes-orders',
            JSON.stringify(orders)
        );

        // -------------------------------------------------
        // 3.5. LIMPAR CARRINHO
        // -------------------------------------------------

        sessionStorage.removeItem('kelly-cakes-cart');

        // -------------------------------------------------
        // 3.6. REDIRECIONAR PARA HISTÓRICO
        // -------------------------------------------------

        location.href = 'historicoPedidos.html';
    });
});
