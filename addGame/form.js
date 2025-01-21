document.getElementById('addGame').addEventListener('submit', function(e){
    e.preventDefault();

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

    fetch('http://localhost:3000/games', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        alert('Jogo adicionado com sucesso!')
    })
    .catch(error => {
        console.error('Erro ao adicionar o jogo:', error)
        alert('Erro ao adicionar o jogo')
    })
    location.reload()
})