const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Habilitar CORS para permitir requisições do frontend
app.use(cors());
app.use(bodyParser.json())

// conexão com o banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',     
    password: 'MySQL#2025',     
    database: 'gamedb',  
});

// Conectar ao banco de dados
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados: ' + err.stack);
        process.exit(1);
    }
    console.log('Conectado ao banco de dados');
});

// Rota para buscar os jogos
app.get('/games', (req, res) => {
    const sql = 'SELECT * FROM games';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send({ message: 'Erro ao buscar jogos', error: err });
            return;
        }
        res.json(results);
    });
});

//Rota para adicionar jogos
app.post('/games', (req, res) => {
    const { title,plataforma, genre, release_date, description, zerado, finishDate, platina, platinaDate, nota, capa } = req.body;

    const queryCheck = 'SELECT * FROM games WHERE title = ?';

    const platinaDateValue = platinaDate? platinaDate: null
    const jogando = zerado ? finishDate : null

    db.query(queryCheck, [title], (err, result) => {

        if (err) {
            res.setHeader('Content-Type', 'application/json')
            console.log('Erro ao conferir duplicidade:', err);
            return res.status(500).send('Erro ao conferir duplicidade')
        }

        if (result.length > 0) {
            console.log('O jogo já existe')
            res.setHeader('Content-Type', 'application/json')
            return res.status(400).send({ error: 'Jogo já adicionado'})
        }

        const queryInsert = 'INSERT INTO games (title,plataforma, genre, release_date, description, zerado, finishDate, platina, platinaDate, nota, capa) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
        
        db.query(queryInsert, [title,plataforma, genre, release_date, description, zerado? 1:0, jogando, platina? 1:0, platinaDateValue, nota, capa], (err, result) => {
            if (err) {
                console.log('Erro ao inserir jogo:', err)
                res.status(500).send('Erro ao adicionar jogo')

            }

            res.setHeader('Content-Type', 'application/json')           
            res.status(200).send({ message: 'Jogo adicionado com sucesso!' })
        })
    })
})

// editar

app.put('/games/:id', (req,res)=>{
    const {id} = req.params
    const {zerado, finishDate, platina, platinaDate, nota} = req.body

    const platinaDateValue = platinaDate? platinaDate: null
    const jogando = zerado ? finishDate : null

    const query = `
    UPDATE games
    SET zerado = ?, finishDate = ?, platina = ?, platinaDate = ?, nota = ?
    WHERE id = ?
    `
    db.query(query, [zerado? 1:0, jogando, platina? 1:0, platinaDateValue, nota, id], (err, result) => {
        if (err) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(500).json('Erro ao atualizar o jogo');
        }

        res.setHeader('Content-Type', 'application/json')
        res.send('Jogo atualizado com sucesso!');
    });
           
})

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
