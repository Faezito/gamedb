const { response } = require("express");

// buscar os jogos do backend
fetch('https://gamedb-y1bu.onrender.com/games', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
}) 
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


// buscar jogador
fetch('http://gamedb-y1bu.onrender.com/users', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
})
.then(response => {
    if(!response.ok){
        throw new Error('Não consegui buscar os dados do usuário')
    }
    return response.json()
})
.then(data => {
    const title = document.getElementById('nameTitle')

    const colocarNome = () => {
        title.textContent = data.username
    }
})
.catch(err => console.error('Erro ao obter dados do usuário', err))


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


//concluir edição
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

//Verificar JWT

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
            console.log('Token OK')
        } else {
            alert(data.message)
        }
    }

    getUserData()

}

document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem('token')
    window.location.href = '/index.html'
})