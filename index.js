
function toggleForms(){
    const loginForm = document.getElementById('loginForm')
    const regForm = document.getElementById('regForm')

    if(loginForm.style.display === 'none'){
        loginForm.style.display = 'block'
        regForm.style.display = 'none'
    } else {
        loginForm.style.display = 'none'
        regForm.style.display = 'block'
    }
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

async function login() {
    const username = document.getElementById('userLogin').value;
    const pass = document.getElementById('passLogin').value;

    if(!username || !pass){
        alert("Usuário ou senha incorretos.")
        return
    }
    try {
        const response = await fetch("https://gamedb-y1bu.onrender.com/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, pass})
        })

        const data =  await response.json()

        if (response.ok){
            alert(data.message)
            localStorage.setItem('token', data.token)
            window.location.href = '/profile.html'
        } else {
            alert(data.message || 'Erro no login.')
        }
    } catch(error) {
        console.error('Erro na solicitação de login', error)
        alert('Erro na solicitação. Tente novamente.')
    }
}

async function register() {
    const username = document.getElementById('userRegister').value
    const name = document.getElementById('nameRegister').value
    const email = document.getElementById('emailRegister').value
    const pass = document.getElementById('passRegister').value

    if(!name || !username || !email || !pass || !isValidEmail(email)){
        alert("Preencha todos os campos!")
        return
    }
    try {
        const response = await fetch("https://gamedb-y1bu.onrender.com/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username, name, email, pass})
        })

        const data = await response.json()
        if (response.ok){
            alert(data.message)
            toggleForms()
        } else {
            alert(data.message)
        }
    } catch(error){
        console.error('Erro no registro', error)
        alert('Erro no registro. Tente novamente.')
    }
}

function checkToken(){
    if(!localStorage.getItem('token')){
        window.location.href = '/profile.html'
    }

    async function getUserData() {
        const token = localStorage.getItem('token')
        try {
            const response = await fetch('https://gamedb-y1bu.onrender.com/protected-route', {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            })

            const data = await response.json()

            if (response.status===200){
                document.getElementById('nameTitle').textContent = `Olá, ${data.name}`;
            } else {
                alert(data.message)
            }
    } catch(error){
        console.error('Erro ao obter dados do usuário', error)
        alert('Erro na solicitação')
    }
}
    getUserData()

    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.removeItem('token')
        window.location.href = '/index.html'
    })
}