
    const form = document.getElementById('login-form');
    const email = document.getElementById('email');
    const senha = document.getElementById('senha');

    form.addEventListener('submit', (e) =>{
    e.preventDefault();
  
        fetch("https://localhost:7229/usuario/login", {
        method: "POST",
        credentials:"include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email:document.getElementById("email").value,
            senha:document.getElementById("senha").value
        })
    })
    .then(response => {

        if (!response.ok) {
            throw new Error("Email ou senha incorretos");
        }

        return response.text();
    })
    .then(data => {
        window.location.href = "portfolio.html";
    })
    .catch(error => {
        alert(error.message);
    });
    
});

