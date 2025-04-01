// controllers/UserController.js
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Usuário já registrado' });
        }

        user = new User({
            name,
            email,
            password,
            role
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            'secrettoken', // Trocar por uma variável de ambiente em produção
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err
                res.json({ token })
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor')
    }
};

// Função para login de usuário
exports.login = async (req, res) => {
    const { email, password } = req.body

    try {
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ msg: 'Credenciais inválidas' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciais inválidas' })
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            'secrettoken', // Trocar por uma variável de ambiente em produção
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Erro no servidor')
    }
};

// Função para obter informações do usuário logado
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor')
    }
};
