const express = require('express');
const router = express.Router();
const controller = require('../controllers/words.controller');


router.get('/train/random', controller.getRandom);




router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
