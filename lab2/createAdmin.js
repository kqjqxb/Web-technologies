// Створення адміністратора: npm run create-admin -- <username> <password>
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('./models/User');
const { MONGO_URL } = require('./config');

async function main() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    console.log('Використання: npm run create-admin -- <username> <password>');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URL);
  const hash = bcrypt.hashSync(password, 7);
  await User.updateOne({ username }, { username, password: hash, roles: ['ADMIN'] }, { upsert: true });
  console.log(`Адміністратора ${username} створено`);
  await mongoose.disconnect();
}

main();
