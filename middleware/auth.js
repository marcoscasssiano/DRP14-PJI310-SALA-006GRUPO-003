// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Comente ou remova a verificação do token
    // const token = req.header('x-auth-token');

    // Verifica se não há token
    // if (!token) {
    //     return res.status(401).json({ msg: 'Nenhum token, autorização negada' });
    // }

    // Verifica o token
    // try {
    //     const decoded = jwt.verify(token, `secrettoken`); // Trocar por uma variável de ambiente em produção
    //     req.user = decoded.user;
    //     next();
    // } catch (err) {
    //     res.status(401).json({ msg: 'Token inválido' });
    // }

    // Permite que todas as requisições passem sem autenticação
    next();
};