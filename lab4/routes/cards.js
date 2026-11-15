const express = require('express');
const controller = require('../controllers/cardsController');
const { cardRules, idRule, checkResult } = require('../middleware/validate');

const router = express.Router();

router.get('/processing-types', controller.getTypes);
router.get('/cards', controller.getAll);
router.get('/cards/:id', idRule, checkResult, controller.getOne);
router.post('/cards', cardRules, checkResult, controller.create);
router.put('/cards/:id', idRule, cardRules, checkResult, controller.update);
router.delete('/cards/:id', idRule, checkResult, controller.remove);

module.exports = router;
