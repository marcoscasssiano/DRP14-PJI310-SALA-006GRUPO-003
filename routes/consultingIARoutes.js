const express = require('express');
const router = express.Router();
const ConsultingIA = require('../controllers/ConsultingIA'); // Importa o controlador
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/', ConsultingIA.main); // Define a rota POST

module.exports = router;