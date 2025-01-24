
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

async function login() {
    const username = document.getElementById('userLogin').value;
    const password = document.getElementById('passLogin').value;

    if(!username || !password){
        alert("Usuário ou senha incorretos.")
        return
    }

    const response = await fetch("https://gamedb-y1bu.onrender.com/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password})
    })

    const data =  await response.json()

    if (response.status === 200){
        alert(data.message)
        localStorage.setItem('token', data.token)
        window.location.href = '/profile.html'
    } else {
        alert(data.message)
    }
}

async function register() {
    const username = document.getElementById('userRegister').value
    const name = document.getElementById('nameRegister').value
    const email = document.getElementById('emailRegister').value
    const pass = document.getElementById('passRegister').value

    if(!name || !username || !email || !pass){
        alert("Preencha todos os campos!")
        return
    }

    const response = await fetch("https://gamedb-y1bu.onrender.com/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username, name, email, pass})
    })

    const data = await response.json()
    if (response.status === 200){
        alert(data.message)
        toggleForms()
    } else {
        alert(data.message)
    }
}

function checkToken(){
    if(!localStorage.getItem('token')){
        window.location.href = '/profile.html'
    }

    async function getUserData() {
        const token = localStorage.getItem('token')
        
        const response = await fetch('https://gamedb-y1bu.onrender.com/protected-route', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        })

        const data = await response.json()
        if (response.status===200){
            document.getElementById(`Olá, ${data.email}`)
        } else {
            alert(data.message)
        }
    }

    getUserData()

    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.removeItem('token')
        window.location.href = '/index.html'
    })
}