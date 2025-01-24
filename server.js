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
const port = 10000

app.use(express.static(path.join(__dirname, '/')))


//Habilitando fontes do Google
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


// Verificar TOKEN

const checkToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]

    if(!token) return res.status(401).json({error:'Acesso negado.'})

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user_id = decoded.userId
        next()
    } catch (err) {
        res.status(401).json({ error: 'Token inválido'})
    }
}


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
app.get('/games', checkToken, async (req, res) => {
    const user_id = req.user_id

    try {
        const result = await client.query('SELECT * FROM games WHERE user_id = $1', [user_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send({ message: 'Erro ao buscar jogos', error: err });
    }
});

// Rota para adicionar jogos
app.post('/games', checkToken, async (req, res) => {
    const { title, plataforma, genre, release_date, description, zerado, finishDate, platina, platinaDate, nota, capa } = req.body;

    const user_id = req.user_id

 //   if (!req.user_id) {
 //       return res.status(401).json({ error: 'Usuário não autenticado' });
//   }

    try {
        // Verificar se o jogo já existe
        const queryCheck = 'SELECT * FROM games WHERE title = $1 AND user_id = $2';
        const result = await client.query(queryCheck, [title, user_id]);

        if (result.rows.length > 0) {
            return res.status(400).json({ error: 'Jogo já adicionado' });
        }

        const queryInsert = `
            INSERT INTO games (title, plataforma, genre, release_date, description, zerado, finishDate, platina, platinaDate, nota, capa, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
            capa,
            user_id
        ]);

        res.status(200).send({ message: 'Jogo adicionado com sucesso!' });
        console.log(title, user_id)
    } catch (err) {
        console.error('Erro ao inserir jogo:', err);
        res.status(500).send({ error: 'Erro ao adicionar jogo.', details: err.message });
    }
});

// Rota para editar jogo
app.put('/games/:id', checkToken, async (req, res) => {
    const { id } = req.params;
    const { zerado, finishDate, platina, platinaDate, nota, capa } = req.body;
    const user_id = req.user_id

    try {
        const queryUpdate = `
            UPDATE games
            SET zerado = $1, finishDate = $2, platina = $3, platinaDate = $4, nota = $5, capa = $6
            WHERE id = $7 AND user_id = $8
        `;

        await client.query(queryUpdate, [
            zerado ? true : false, 
            zerado ? finishDate || null : null, 
            platina ? true : false, 
            platinaDate || null, 
            nota, 
            capa,
            id,
            user_id
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

        const salt = await bcrypt.genSalt(5)
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

//rota protegida

app.get('/protected-route', checkToken, (req,res)=> {
        res.json({message: 'Bem-vindo à rota protegida!', user: req.user_id})
    })



// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando`);
});
