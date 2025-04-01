//bug
//nao esta entrando primeiro na tela de login
//acesso aos estudos sem estar autenticado
//se nao estiver autenticado ter que ser forcado a vir para tela de login

document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    
    if (response.ok) {
        sessionStorage.setItem('token', result.token);
        
        const expirationTime = new Date().getTime() + 40 * 60 * 1000;
        sessionStorage.setItem('tokenExpiration', expirationTime);

        window.location.href = '/';
    } else {
        alert('Login falhou: ' + result.msg);
    }
});

// function checkTokenExpiration() {
//     const expirationTime = sessionStorage.getItem('tokenExpiration');
//     if (expirationTime && new Date().getTime() > expirationTime) {

//         sessionStorage.removeItem('token');
//         sessionStorage.removeItem('tokenExpiration');
//         alert('Sua sessão expirou. Por favor, faça login novamente.');
//         window.location.href = '/login';
//     }
// }

// window.onload = checkTokenExpiration;