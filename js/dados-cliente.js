
(async () => {
    const nome = document.querySelector('#cliente-nome');
    const email = document.querySelector('#cliente-email');
    const telefone = document.querySelector('#cliente-telefone');

    // Verifica se existe usuário conectado.
    const usuarioLocal = window.KellyAuth?.getUser();

    if (!usuarioLocal) {
        location.replace('login.html?next=confirmarBolo.html');
        return;
    }

    // Exibe os dados locais inicialmente.
    const exibirDados = (usuario) => {
        nome.textContent =
            usuario.nome ?? usuario.Nome ??
            usuario.name ?? 'Nome não informado';

        email.textContent =
            usuario.email ?? usuario.Email ??
            'E-mail não informado';

        telefone.textContent =
            usuario.telefone ?? usuario.Telefone ??
            usuario.phone ?? 'Telefone não informado';
    };

    exibirDados(usuarioLocal);

    // Tenta buscar os dados atualizados do usuário no backend.
    try {
        const resposta = await fetch(
            'https://localhost:7229/usuario/perfil',
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (resposta.ok) {
            const usuarioApi = await resposta.json();

            // Aceita resposta com ou sem um objeto "usuario" interno.
            const dados = usuarioApi.usuario ?? usuarioApi;

            exibirDados(dados);
        }
    } catch (erro) {
        console.error('Não foi possível buscar o perfil na API:', erro);
    }
})();
