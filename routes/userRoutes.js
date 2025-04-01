// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middleware/auth');

// Rotas de usuário
router.post('/register', auth, UserController.register);
router.post('/login', UserController.login);
router.get('/me', auth, UserController.getUser);

module.exports = router;
