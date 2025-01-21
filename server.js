const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const path = require('path')
const bodyParser = require('body-parser');
const helmet = require('helmet')


// Conexão com o PostgreSQL
const connectionString = 'postgresql://root:3YFjjukSDbjeyycEWchNMlShyQbs2l8b@dpg-cu7sv1d6l47c73am90jg-a.oregon-postgres.render.com/gamedb_nklz';

const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect()
.then(() => console.log('Conectado ao DB PostgreSQL'))
.catch(err => {
    console.error('Erro ao conectar à DB:', err);
    process.exit(1);
});

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')))
//Habilitando fontes do Google
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'none'; font-src 'self' https://fonts.gstatic.com;");
    next();
});

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "https://gamedb-y1bu.onrender.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
    }
}))

// Habilitar CORS e body parser
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

// Rota para buscar os jogos
app.get('/games', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM games');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send({ message: 'Erro ao buscar jogos', error: err });
    }
});

// Rota para adicionar jogos
app.post('/games', async (req, res) => {
    const { title, plataforma, genre, release_date, description, zerado, finishDate, platina, platinaDate, nota, capa } = req.body;

    try {
        // Verificar se o jogo já existe
        const queryCheck = 'SELECT * FROM games WHERE title = $1';
        const result = await client.query(queryCheck, [title]);

        if (result.rows.length > 0) {
            return res.status(400).json({ error: 'Jogo já adicionado' });
        }

        const queryInsert = `
            INSERT INTO games (title, plataforma, genre, release_date, description, zerado, finishDate, platina, platinaDate, nota, capa)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;

        await client.query(queryInsert, [
            title, 
            plataforma, 
            genre, 
            release_date, 
            description, 
            zerado ? true : false, 
            finishDate || null, 
            platina ? true : false, 
            platinaDate || null, 
            nota, 
            capa
        ]);

        res.status(200).send({ message: 'Jogo adicionado com sucesso!' });
    } catch (err) {
        console.error('Erro ao inserir jogo:', err);
        res.status(500).send({ error: 'Erro ao adicionar jogo' });
    }
});

// Rota para editar jogo
app.put('/games/:id', async (req, res) => {
    const { id } = req.params;
    const { zerado, finishDate, platina, platinaDate, nota } = req.body;

    try {
        const queryUpdate = `
            UPDATE games
            SET zerado = $1, finishDate = $2, platina = $3, platinaDate = $4, nota = $5
            WHERE id = $6
        `;

        await client.query(queryUpdate, [
            zerado ? true : false, 
            zerado ? finishDate || null : null, 
            platina ? true : false, 
            platinaDate || null, 
            nota, 
            id
        ]);

        res.send('Jogo atualizado com sucesso!');
    } catch (err) {
        console.error('Erro ao atualizar jogo:', err);
        res.status(500).json({ error: 'Erro ao atualizar o jogo' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
