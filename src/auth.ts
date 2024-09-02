document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        //alert('Inicio de sesión exitoso');
        // Puedes almacenar el token de autenticación en localStorage
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.userId);
        // Redirigir al usuario a la página principal
        window.location.href = 'index.html';
    } else {
        alert('Credenciales inválidas');
    }
});

document.getElementById('registerForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, email, password })
    });

    if (response.ok) {
        alert('Gracias por registrarse. Presione << Aceptar >> para continuar.');
        // Redirige al usuario a la página de inicio de sesión
        window.location.href = 'login.html';
    } else {
        alert('Error al registrar la cuenta. Por favor, intenta nuevamente.');
    }
});

