// Перевірка REST API: повний цикл CRUD, валідація та обробка помилок.
// Сервер має бути запущений (npm start), колекція заповнена (npm run seed).
const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function call(title, method, path, body, raw) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) options.body = raw ? body : JSON.stringify(body);
  const res = await fetch(BASE + path, options);
  const data = await res.json();
  console.log(`\n### ${title}\n${method} ${path}`);
  if (body !== undefined) console.log(`body: ${raw ? body : JSON.stringify(body)}`);
  console.log(`→ ${res.status}\n${JSON.stringify(data, null, 2)}`);
  return data;
}

const short = (cards) => cards.map((c) => `${c.detail} | ${c.processingType} | ${c.duration} хв`).join('\n');

(async () => {
  const all = await fetch(`${BASE}/api/cards`).then((r) => r.json());
  console.log(`### Перегляд усіх записів\nGET /api/cards\n→ 200 (${all.length} записів)\n${short(all)}`);

  const created = await call('Додавання запису', 'POST', '/api/cards',
    { detail: 'Кронштейн', processingType: 'Зварювальна', duration: 35 });
  await call('Перегляд одного запису', 'GET', `/api/cards/${created._id}`);
  await call('Редагування запису', 'PUT', `/api/cards/${created._id}`,
    { detail: 'Кронштейн посилений', processingType: 'Зварювальна', duration: 50 });

  const sorted = await fetch(`${BASE}/api/cards?sort=duration&order=desc`).then((r) => r.json());
  console.log('\n### Сортування за тривалістю (спадання)\nGET /api/cards?sort=duration&order=desc');
  console.log(`→ 200\n${short(sorted)}`);
  const found = await fetch(`${BASE}/api/cards?search=${encodeURIComponent('крон')}`).then((r) => r.json());
  console.log(`\n### Пошук за деталлю\nGET /api/cards?search=крон\n→ 200\n${short(found)}`);

  await call('Видалення запису', 'DELETE', `/api/cards/${created._id}`);
  await call('Повторне видалення (запису вже немає)', 'DELETE', `/api/cards/${created._id}`);

  await call('Валідація: некоректні значення полів', 'POST', '/api/cards',
    { detail: 'В', processingType: 'Лазерна', duration: -5 });
  await call('Валідація: дробова тривалість', 'POST', '/api/cards',
    { detail: 'Шайба', processingType: 'Штампування', duration: 2.5 });
  await call('Некоректний id', 'GET', '/api/cards/123');
  await call('Некоректний JSON', 'POST', '/api/cards', '{"detail": "Вал",', true);
  await call('Невідомий маршрут', 'GET', '/api/unknown');
})();
