// Перевірка API: реєстрація, вхід, токен, ролі, термін дії токена.
// Сервер має бути запущений (npm start), адміністратор створений (npm run create-admin -- admin admin123).
const BASE = process.env.BASE_URL || 'http://localhost:5001';
const WAIT_EXPIRY = !process.argv.includes('--no-wait');

async function call(title, method, path, { body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, { method, headers, body: body && JSON.stringify(body) });
  const data = await res.json();
  console.log(`\n### ${title}\n${method} ${path}${token ? '  (Authorization: Bearer …)' : ''}`);
  if (body) console.log(`body: ${JSON.stringify(body)}`);
  console.log(`→ ${res.status}\n${JSON.stringify(data, null, 2)}`);
  return data;
}

const decode = (t) => JSON.parse(Buffer.from(t.split('.')[1], 'base64url').toString());

(async () => {
  await call('Реєстрація користувача', 'POST', '/auth/registration',
    { body: { username: 'user', password: 'user1234' } });
  await call('Повторна реєстрація з тим самим іменем', 'POST', '/auth/registration',
    { body: { username: 'user', password: 'user1234' } });
  await call('Реєстрація з некоректними даними', 'POST', '/auth/registration',
    { body: { username: 'ab', password: '1' } });
  await call('Вхід з невірним паролем', 'POST', '/auth/login',
    { body: { username: 'user', password: 'wrong' } });

  const { token: userToken } = await call('Вхід користувача user', 'POST', '/auth/login',
    { body: { username: 'user', password: 'user1234' } });
  const [h, p] = userToken.split('.');
  console.log('\nheader  =', Buffer.from(h, 'base64url').toString());
  console.log('payload =', JSON.stringify(decode(userToken)));

  await call('Профіль без токена', 'GET', '/auth/profile');
  await call('Профіль з токеном user', 'GET', '/auth/profile', { token: userToken });
  await call('Список користувачів з токеном user (потрібна роль ADMIN)', 'GET', '/auth/users',
    { token: userToken });
  await call('Підроблений токен (змінено підпис)', 'GET', '/auth/profile',
    { token: userToken.slice(0, -3) + (userToken.endsWith('AAA') ? 'BBB' : 'AAA') });

  const { token: adminToken } = await call('Вхід адміністратора', 'POST', '/auth/login',
    { body: { username: 'admin', password: 'admin123' } });
  console.log('\npayload =', JSON.stringify(decode(adminToken)));
  await call('Реєстрація user2', 'POST', '/auth/registration',
    { body: { username: 'user2', password: 'pass2222' } });
  const users = await call('Список користувачів (ADMIN)', 'GET', '/auth/users', { token: adminToken });
  const user2 = users.find((u) => u.username === 'user2');
  await call('Надання ролі ADMIN користувачу user2', 'PATCH', `/auth/users/${user2._id}/roles`,
    { token: adminToken, body: { roles: ['USER', 'ADMIN'] } });
  await call('Видалення user2 (ADMIN)', 'DELETE', `/auth/users/${user2._id}`, { token: adminToken });

  if (WAIT_EXPIRY) {
    const left = decode(userToken).exp - Date.now() / 1000;
    console.log(`\n... очікування закінчення терміну дії токена user (${Math.ceil(left)} с)`);
    await new Promise((r) => setTimeout(r, (left + 2) * 1000));
    await call('Профіль з простроченим токеном user', 'GET', '/auth/profile', { token: userToken });
  }
})();
