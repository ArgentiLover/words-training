const express = require('express');
const router = express.Router();
const controller = require('../controllers/words.controller');

router.post('/start', controller.startTraining);
router.get('/next', controller.getNext);
router.post('/check', controller.checkAnswer);

module.exports = router;
