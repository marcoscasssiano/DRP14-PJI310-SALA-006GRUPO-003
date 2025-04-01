// routes/stabilityStudyRoutes.js
const express = require('express');
const router = express.Router();
const StabilityStudyController = require('../controllers/StabilityStudyController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Rotas de estudo de estabilidade
router.post('/', [auth, admin], StabilityStudyController.createStudy);
router.get('/', auth, StabilityStudyController.getAllStudies);
router.get('/:id', auth, StabilityStudyController.getStudyById);
router.put('/:id', [auth, admin], StabilityStudyController.updateStudy);
router.delete('/:id', [auth, admin], StabilityStudyController.deleteStudy);

module.exports = router;
