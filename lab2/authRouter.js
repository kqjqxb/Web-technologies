const Router = require('express');
const { body } = require('express-validator');

const controller = require('./authController');
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');

const router = new Router();

router.post('/registration', [
  body('username', 'Ім’я користувача: 3–30 символів (латиниця, цифри, _)')
    .isString().trim().matches(/^[A-Za-z0-9_]{3,30}$/),
  body('password', 'Пароль має містити від 4 до 20 символів').isString().isLength({ min: 4, max: 20 }),
], controller.registration);

router.post('/login', controller.login);

router.get('/profile', authMiddleware, controller.profile);

router.get('/users', roleMiddleware(['ADMIN']), controller.getUsers);
router.patch('/users/:id/roles', roleMiddleware(['ADMIN']), [
  body('roles', 'roles – непорожній масив з USER та/або ADMIN')
    .isArray({ min: 1 }).custom((roles) => roles.every((r) => ['USER', 'ADMIN'].includes(r))),
], controller.setRoles);
router.delete('/users/:id', roleMiddleware(['ADMIN']), controller.deleteUser);

module.exports = router;
