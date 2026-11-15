let token = null;
let timer = null;

const $ = (id) => document.getElementById(id);

// Запит до API; токен передається в заголовку Authorization
async function api(method, url, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  $('status').textContent = `${method} ${url} → ${res.status}`;
  $('status').className = `badge ${res.ok ? 'ok' : 'err'}`;
  $('response').textContent = JSON.stringify(data, null, 2);
  return { ok: res.ok, data };
}

// Payload JWT – це base64url-закодований JSON (не зашифрований)
function decodePayload(jwt) {
  const part = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(part), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function showToken() {
  clearInterval(timer);
  if (!token) {
    $('token-status').textContent = 'Токен відсутній';
    $('token-payload').textContent = '';
    return;
  }
  const payload = decodePayload(token);
  $('token-payload').textContent = JSON.stringify(payload, null, 2);
  const tick = () => {
    const left = Math.round(payload.exp - Date.now() / 1000);
    $('token-status').textContent = left > 0
      ? `Токен дійсний ще ${left} с (exp − iat = ${payload.exp - payload.iat} с)`
      : 'Термін дії токена минув';
  };
  tick();
  timer = setInterval(tick, 1000);
}

const credentials = () => ({ username: $('username').value.trim(), password: $('password').value });

$('btn-register').onclick = () => api('POST', '/auth/registration', credentials());

$('auth-form').onsubmit = async (e) => {
  e.preventDefault();
  const { ok, data } = await api('POST', '/auth/login', credentials());
  token = ok ? data.token : null;
  $('users-card').hidden = true;
  showToken();
};

$('btn-logout').onclick = () => {
  token = null;
  showToken();
  $('users-card').hidden = true;
};

$('btn-profile').onclick = () => api('GET', '/auth/profile');

$('btn-users').onclick = loadUsers;

async function loadUsers() {
  const { ok, data } = await api('GET', '/auth/users');
  $('users-card').hidden = !ok;
  if (!ok) return;
  const rows = data.map((u) => {
    const tr = document.createElement('tr');
    const isAdmin = u.roles.includes('ADMIN');
    tr.innerHTML = '<td></td><td></td><td class="hash"></td><td class="actions"></td>';
    tr.children[0].textContent = u.username;
    tr.children[1].textContent = u.roles.join(', ');
    tr.children[2].textContent = u.password;
    const toggle = document.createElement('button');
    toggle.textContent = isAdmin ? 'Зробити USER' : 'Зробити ADMIN';
    toggle.onclick = async () => {
      await api('PATCH', `/auth/users/${u._id}/roles`, { roles: [isAdmin ? 'USER' : 'ADMIN'] });
      loadUsers();
    };
    const del = document.createElement('button');
    del.textContent = 'Видалити';
    del.className = 'danger';
    del.onclick = async () => {
      const r = await api('DELETE', `/auth/users/${u._id}`);
      if (r.ok) loadUsers();
    };
    tr.children[3].append(toggle, del);
    return tr;
  });
  document.querySelector('#users-table tbody').replaceChildren(...rows);
}
