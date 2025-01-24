const express = require('express');
const { Client, Pool } = require('pg');
const cors = require('cors');
const path = require('path')
const bodyParser = require('body-parser');
const helmet = require('helmet')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()


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

app.use(express.static(path.join(__dirname, '/')))


//Habilitando fontes do Google
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'none'; font-src 'self' https://fonts.gstatic.com;");
    next();
});

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://gamedb-y1bu.onrender.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
    }
}))

// Habilitar CORS e body parser
app.use(cors({
    origin: 'https://gamedb-y1bu.onrender.com'    
}));
app.use(bodyParser.json());

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'))
})

app.get('/profile', (req,res) => {
    res.sendFile(path.join(__dirname, 'profile.html'))
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
        res.status(500).send({ error: 'Erro ao adicionar jogo 1' });
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


// cadastrar usuário

app.post('/register', async(req,res) => {
    const { username, name, email, pass } = req.body

    try{
        const userExists = await client.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email])

        if(userExists.rows.length > 0){
            return res.status(400).json({message: 'O usuário já existe.'})
        }

        const salt = await bcrypt.genSalt(10)
        const senha = await bcrypt.hash(pass, salt)

        await client.query('INSERT INTO users (username, name, email, pass) VALUES ($1, $2, $3, $4)', [username, name, email, senha]) 
        return res.status(201).json({message: 'Usuário cadastrado com sucesso!'})
    } catch (err){
        console.error('Erro na base de dados de cadastro', err)
        res.status(500).json({message: 'Erro no servidor de cadastro'})
    }
})

app.post('/login', async(req, res)=> {
    const {username, pass} = req.body

    if(!username || !pass) {
        return res.status(400).json({message:'Usuário ou senha incorretos.'})
    }

    try {
        const user = await client.query('SELECT * FROM users WHERE username = $1', [username])

        if (user.rows.length===0){
            return res.status(400).json({message: 'Usuário não encontrado.'})
        }

        const validPass = await bcrypt.compare(pass, user.rows[0].pass)

        if(!validPass){
            return res.status(400).json({message: 'Usuário ou senha incorretos.'})
        }

        const token = jwt.sign(
            {userId: user.rows[0].id, email: user.rows[0].email},
            process.env.JWT_SECRET,
            {expiresIn: '2h'}
        )

        res.status(200).json({message: 'Logado com sucesso', token})
    }catch(err){
        console.error(err)
        return res.status(400).json({message: 'Erro no servidor de login.'})
    }
})

app.get('/protected-route', (req,res)=> {
    const token = req.headers['authorization']

    if(!token){
        return res.status(403).json({message: 'Token necessário'})
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err){
            return res.status(401).json({message: 'Token inválido'})
        }

        res.json({message: 'Bem-vindo à rota protegida!', user: decoded})
    })
})



// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em ${port}`);
});
