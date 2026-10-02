
  const form = document.getElementById('register-form');
  const message = document.querySelector('#auth-message');
  const next = new URLSearchParams(location.search).get('next') || 'portfolio.html';
  const nome = document.getElementById('nome');
  const numTelefone = document.getElementById('numTelefone');
  const cpf =document.getElementById('cpf');
  const email = document.getElementById('email');
  const emailConfirmar = document.getElementById('emailConfirmar');
  const senha = document.getElementById('senha');
  const confirmarSenha = document.getElementById('confirmarSenha');

form.addEventListener('submit', function (event) {

    event.preventDefault();

    if (!nome || !email || !numTelefone || !senha || !cpf) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    fetch('https://localhost:7229/usuario', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            Nome: document.getElementById("nome").value,
            Cpf: document.getElementById("cpf").value,
            Email: document.getElementById("email").value,
            Telefone: document.getElementById("numTelefone").value,
            Senha: document.getElementById("senha").value,
        }),
    })

        .then(response => response.json())
        .then(data => {

            alert("Conta criada com sucesso!");

        })
        .catch(error => {

          

        });
});

if (numTelefone) numTelefone.addEventListener("keyup", validarNumTelefone);
if (nome) nome.addEventListener("keyup", validarNome);
if (senha) senha.addEventListener("keyup", validarSenha);
if (numTelefone) numTelefone.addEventListener("keyup", validarNumTelefone);
if (email) email.addEventListener("keyup", validarEmail);
if (emailConfirmar) emailConfirmar.addEventListener("keyup", validarConfirmarEmail);
if (confirmarSenha) confirmarSenha.addEventListener("keyup", validarconfirmarSenha);


function validarNome() {
    const nomeValor = nome.value.trim();

    if (nomeValor === '') {
        validarErro(nome, 'Campo obrigatório')
        return false;
    } else if (nomeValor.length < 3) {
        validarErro(nome, 'Campo obrigatório')
        return false;
    } else {
        validarSucesso(nome);
        return true;
    }
}

function validarNumTelefone() {

    const numLimpo = numTelefone.value.replace(/\D/g, '');

    if (numLimpo === '') {
        validarErro(numTelefone, 'Campo obrigatório');
        return false;

    } else if (numLimpo.length !== 11) {
        validarErro(numTelefone, 'Formato incorreto');
        return false;

    } else {

        numTelefone.value = numLimpo.replace(
            /^(\d{2})(\d{5})(\d{4})$/,
            "($1) $2-$3"
        );

        validarSucesso(numTelefone);
        return true;
    }

}

function validarEmail() {
    const emailValor = email.value.trim();

    if (emailValor === '') {
        validarErro(email, 'Campo obrigatório');
        return false;
    } else {
        validarSucesso(email);
        return true;
    }
}

function validarConfirmarEmail() {
    const emailValor = email.value.trim();
    const emailConfirmarValor = emailConfirmar.value.trim();

    if (emailConfirmarValor === '') {
        validarErro(emailConfirmar, 'Campo obrigatório');
        return false;
    } else if (emailValor !== emailConfirmarValor) {
        validarErro(emailConfirmar, 'Os emails não coincidens');
        return false;
    } else {
        validarSucesso(emailConfirmar);
        return true;
    }
}

function validarSenha() {
    
    const senhaValor = senha.value.trim();
    if (senhaValor === '') {
        validarErro(senha, 'Campo obrigatório');
        return false;
    } else if (senhaValor.length < 8) {
        validarErro(senha, 'A senha deve ter no mínino 8 caracteres');
        return false;
    } else {
        validarSucesso(senha);
        return true;
    }

}
function validarconfirmarSenha() {
    const confirmarSenhaValor = confirmarSenha.value.trim();
    const senhaValor = senha.value.trim();



    if (confirmarSenhaValor === '') {
        validarErro(confirmarSenha, 'Campo obrigatório');
        return false;
    } else if (confirmarSenhaValor !== senhaValor) {
        validarErro(confirmarSenha, 'As senhas não coincides');
        return false;
    } else {
        validarSucesso(confirmarSenha);
        return true;
    }

}

function validarErro(input, mensagem) {
    const campo = input.parentElement;
    const small = campo.querySelector("small");

    
    campo.className = "campo error";
}

function validarSucesso(input) {
    const campo = input.parentElement;
    const small = campo.querySelector("small");

    campo.className = "campo success";
}


//   form.addEventListener('submit', (event) => {
//     event.preventDefault();
//     const data = Object.fromEntries(new FormData(form));
//     const accounts = JSON.parse(localStorage.getItem('kelly-cakes-accounts') || '[]');
//     if (accounts.some((item) => item.email.toLowerCase() === data.email.toLowerCase())) { message.textContent = 'Este e-mail já possui cadastro. Faça login.'; return; }
//     accounts.push(data);
//     localStorage.setItem('kelly-cakes-accounts', JSON.stringify(accounts));
//     KellyAuth.save({ name: data.name, email: data.email, phone: data.phone });
//     location.href = next;
//   });
// })();
