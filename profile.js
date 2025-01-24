// buscar os jogos do backend
fetch('https://gamedb-y1bu.onrender.com/games', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
}) 
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro:', error))


fetch('https://gamedb-y1bu.onrender.com/games')
    .then(response => {
            if (!response.ok) {
                throw new Error('Erro na resposta da API')
            }
            return response.json()
    })
    .then(data => {
        const container = document.getElementById('games-container');
        data.forEach(game => {
            const gameElement = document.createElement('div');
            gameElement.classList.add('game');

            const zeradoTxt = game.zerado? '✅':'❌';
            const platinado = game.platina? '✅':'❌';

            const formatarData = (dateString) => {
                return dateString
                    ? new Date(dateString).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })
                    : '';
            }

            const nota = game.nota === null? '': game.nota
            const platDate = game.platinaDate === null? 0 : game.platinaDate
            let ano = new Date().getFullYear()

            gameElement.innerHTML = `
                <div class="game-img">
                <img src="${game.capa}" alt="Capa de ${game.title}" />
                <p>ID: ${ano}${game.id}</p>
                </div>
                <div class="game-data">
                <h2>${game.title} (${game.plataforma})</h2>
                <p><strong>Gênero:</strong> ${game.genre}</p>
                <p><strong>Lançamento:</strong> ${(formatarData(game.release_date))}</p>
                <p><strong>Main Story:</strong> ${zeradoTxt} ${formatarData(game.finishDate)}</p>
                <p><strong>100%/Platina:</strong> ${platinado} ${formatarData(game.platinaDate)}</p>
                <p><strong>Avaliação:</strong> ${nota}</p>
                <button onclick="abrirModal(${game.id}, ${game.zerado}, '${game.finishDate}', ${game.platina}, ${platDate}, ${nota})">Editar</button>
                </div>
            `;

            container.appendChild(gameElement);
        });
    })
    .catch(error => console.error('Erro ao carregar os jogos:', error));

    // adicionar jogos

const openModalButton = document.getElementById('openModalButton');
const closeModalButton = document.getElementById('closeModalButton');
const modal = document.getElementById('gameModal');

openModalButton.addEventListener('click', () => {
    modal.style.display = 'block';
});

closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

document.getElementById('addGame').addEventListener('submit', (event) => {
    event.preventDefault();
    console.log('Jogo adicionado');
    modal.style.display = 'none'; 
});


            // editar jogos

//abrir modal de edição

function abrirModal(id, zerado, finishDate, platina, platinaDate, nota) {

    document.getElementById('edit-id').value = id;
    document.getElementById('edit-zerado').checked = zerado;
    document.getElementById('edit-finishDate').value = finishDate;
    document.getElementById('edit-platina').checked = platina;
    document.getElementById('edit-platinaDate').value = platinaDate;
    document.getElementById('edit-nota').value = nota;

    document.getElementById('editModal').style.display = 'block'
}

// fechar modal
function fecharModal(){
    document.getElementById('editModal').style.display = 'none';
}

document.getElementById('editForm').addEventListener('submit', (e) => {
    e.preventDefault()

    const id = document.getElementById('edit-id').value;

    const finishDate = document.getElementById('edit-finishDate').value || null;
    const platinaDate = document.getElementById('edit-platinaDate').value || null;

    const updateGame = {
        zerado: document.getElementById('edit-zerado').checked ? true : false,
        finishDate: finishDate,
        platina: document.getElementById('edit-platina').checked ? true : false,
        platinaDate: platinaDate,
        nota: document.getElementById('edit-nota').value || null,
    }

    console.log('Dados:', updateGame)

    fetch(`https://gamedb-y1bu.onrender.com/games/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateGame)
    })
    .then(response => response.text())
    .then(message => {
        alert(message)
        fecharModal()
    })
    .catch(error => console.error('Erro ao atualizar o jogo:', error));
})

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
        window.location.href = '/login.html'
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