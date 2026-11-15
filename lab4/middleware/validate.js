const { body, param, validationResult } = require('express-validator');
const { isValidObjectId } = require('mongoose');
const { PROCESSING_TYPES } = require('../models/TechCard');

// Правила для тіла запиту POST/PUT
const cardRules = [
  body('detail').isString().withMessage('Деталь – рядок').trim()
    .isLength({ min: 2, max: 100 }).withMessage('Назва деталі: від 2 до 100 символів'),
  body('processingType').isIn(PROCESSING_TYPES)
    .withMessage(`Вид обробки – одне зі значень: ${PROCESSING_TYPES.join(', ')}`),
  body('duration').isInt({ min: 1, max: 10000 }).withMessage('Тривалість – ціле число від 1 до 10000 хв')
    .toInt(),
];

const idRule = [
  param('id').custom(isValidObjectId).withMessage('Некоректний id запису'),
];

// Повертає 400 зі списком помилок, якщо правила не виконано
function checkResult(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({
    message: 'Помилка валідації',
    errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
  });
}

module.exports = { cardRules, idRule, checkResult };
