document.getElementById('addGame').addEventListener('submit', function(e){
    e.preventDefault();

    const token = localStorage.getItem('token')
    if(!token) {
        alert('Você precisa estar logado para adicionar jogos.')
        return;
    }


    const formData = {
        title: document.getElementById('title').value,
        plataforma: document.getElementById('plataforma').value,
        genre: document.getElementById('genre').value,
        release_date: document.getElementById('release').value,
        description: document.getElementById('description').value,
        zerado: document.getElementById('zerado').checked,
        finishDate: document.getElementById('finishDate').value,
        platina: document.getElementById('platina').checked,
        platinaDate: document.getElementById('platinaDate').value,
        nota: document.getElementById('nota').value,
        capa: document.getElementById('capa').value
    }

    fetch('https://gamedb-y1bu.onrender.com/games', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if(!response.ok) {
            return response.json().then(errorData => {
                throw new Error (errorData.error || 'Erro ao adicionar o jogo')
            })
        }
        return response.json()
    })
    .then(data => {
        alert('Jogo adicionado com sucesso!')
        location.reload()
    })
    .catch(error => {
        console.error('Erro ao adicionar o jogo:', error)
        alert('Erro ao adicionar o jogo')
    })
})