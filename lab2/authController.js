const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('./models/User');
const Role = require('./models/Role');
const { JWT_SECRET, JWT_EXPIRES_IN, STUDENT } = require('./config');

function generateAccessToken(id, username, roles) {
  const payload = { id, username, roles, ...STUDENT };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

const publicUser = (u) => ({ id: u._id, username: u.username, roles: u.roles });

class AuthController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Помилка під час реєстрації', errors: errors.array() });
      }
      const { username, password } = req.body;
      if (await User.findOne({ username })) {
        return res.status(400).json({ message: 'Користувач з таким іменем уже існує' });
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      const userRole = await Role.findOne({ value: 'USER' });
      const user = await User.create({ username, password: hashPassword, roles: [userRole.value] });
      return res.status(201).json({ message: 'Користувача успішно зареєстровано', user: publicUser(user) });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Помилка сервера під час реєстрації' });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user || !bcrypt.compareSync(String(password || ''), user.password)) {
        return res.status(400).json({ message: 'Невірне ім’я користувача або пароль' });
      }
      const token = generateAccessToken(user._id, user.username, user.roles);
      return res.json({ token, expiresIn: JWT_EXPIRES_IN });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Помилка сервера під час входу' });
    }
  }

  // USER і ADMIN: власний профіль і вміст токена
  async profile(req, res) {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
    const { iat, exp } = req.user;
    return res.json({
      user: publicUser(user),
      token: { ...req.user, issuedAt: new Date(iat * 1000), expiresAt: new Date(exp * 1000) },
    });
  }

  // ADMIN: список усіх користувачів (разом з хешами паролів)
  async getUsers(req, res) {
    const users = await User.find().lean();
    return res.json(users);
  }

  // ADMIN: зміна ролей користувача
  async setRoles(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Некоректні ролі', errors: errors.array() });
    try {
      const user = await User.findByIdAndUpdate(req.params.id, { roles: req.body.roles }, { new: true });
      if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
      return res.json({ message: 'Ролі змінено', user: publicUser(user) });
    } catch (e) {
      return res.status(400).json({ message: 'Некоректний id користувача' });
    }
  }

  // ADMIN: видалення користувача (крім самого себе)
  async deleteUser(req, res) {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Адміністратор не може видалити сам себе' });
    }
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
      return res.json({ message: 'Користувача видалено', user: publicUser(user) });
    } catch (e) {
      return res.status(400).json({ message: 'Некоректний id користувача' });
    }
  }
}

module.exports = new AuthController();
