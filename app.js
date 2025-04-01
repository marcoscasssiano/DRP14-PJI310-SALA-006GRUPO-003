const express = require('express');
const connectDB = require('./config/database');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const stabilityStudyRoutes = require('./routes/stabilityStudyRoutes');
const consultingIARoutes = require('./routes/consultingIARoutes')
const errorHandler = require('./middleware/errorHandler');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

connectDB();

// Limitar requisições
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requisições por IP
});
app.use(limiter);

// Middleware para o body parser
app.use(express.json());

// Rotas API
app.use('/api/users', userRoutes);
app.use('/api/studies', stabilityStudyRoutes);
app.use('/api/consulting-ia', consultingIARoutes)

// Rotas Front
app.use(express.static('views'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/studies', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'studies.html'));
});

app.get('/studies/create', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'create.html'));
});

app.get('/studies/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'view.html'));
});

// Rotas de suporte para views
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de tratamento de erros
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`\nServidor iniciado com sucesso!\n`);
    console.log(`URL -> http://localhost:${PORT}\n`);
});