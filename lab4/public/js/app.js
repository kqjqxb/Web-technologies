const API = '/api/cards';
const form = document.getElementById('card-form');
const idField = document.getElementById('card-id');
const errorsBox = document.getElementById('errors');
const state = { sort: 'createdAt', order: 'asc', search: '', type: '' };

async function request(url, options = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function loadTypes() {
  const types = await request('/api/processing-types');
  for (const select of [form.processingType, document.getElementById('filter-type')]) {
    select.append(...types.map((t) => new Option(t, t)));
  }
}

async function loadCards() {
  const query = new URLSearchParams(state).toString();
  const cards = await request(`${API}?${query}`);
  const rows = cards.map((card, i) => {
    const tr = document.createElement('tr');
    tr.dataset.id = card._id;
    tr.innerHTML = `<td>${i + 1}</td><td></td><td></td><td>${card.duration}</td>
      <td class="actions"><a href="#" class="edit">Змінити</a><a href="#" class="delete">Видалити</a></td>`;
    tr.children[1].textContent = card.detail;
    tr.children[2].textContent = card.processingType;
    return tr;
  });
  document.getElementById('cards').replaceChildren(...rows);
  const total = cards.reduce((sum, c) => sum + c.duration, 0);
  document.getElementById('summary').textContent =
    `Записів: ${cards.length}, сумарна тривалість обробки: ${total} хв`;
  document.querySelectorAll('th[data-sort]').forEach((th) => {
    th.classList.toggle('asc', th.dataset.sort === state.sort && state.order === 'asc');
    th.classList.toggle('desc', th.dataset.sort === state.sort && state.order === 'desc');
  });
}

function showErrors(err) {
  const list = err.errors ? err.errors.map((e) => e.message) : [err.message || 'Помилка запиту'];
  const items = list.map((text) => Object.assign(document.createElement('li'), { textContent: text }));
  errorsBox.replaceChildren(...items);
  errorsBox.hidden = false;
}

function resetForm() {
  form.reset();
  idField.value = '';
  errorsBox.hidden = true;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const card = {
    detail: form.detail.value.trim(),
    processingType: form.processingType.value,
    duration: form.duration.value === '' ? null : Number(form.duration.value),
  };
  const id = idField.value;
  try {
    await request(id ? `${API}/${id}` : API, { method: id ? 'PUT' : 'POST', body: JSON.stringify(card) });
    resetForm();
    await loadCards();
  } catch (err) {
    showErrors(err);
  }
});

document.getElementById('reset-btn').addEventListener('click', resetForm);

document.getElementById('cards').addEventListener('click', async (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  e.preventDefault();
  const { id } = link.closest('tr').dataset;
  try {
    if (link.classList.contains('edit')) {
      const card = await request(`${API}/${id}`);
      idField.value = card._id;
      form.detail.value = card.detail;
      form.processingType.value = card.processingType;
      form.duration.value = card.duration;
      errorsBox.hidden = true;
    } else if (confirm('Видалити технологічну карту?')) {
      await request(`${API}/${id}`, { method: 'DELETE' });
      if (idField.value === id) resetForm();
      await loadCards();
    }
  } catch (err) {
    showErrors(err);
  }
});

document.querySelectorAll('th[data-sort]').forEach((th) => th.addEventListener('click', () => {
  state.order = state.sort === th.dataset.sort && state.order === 'asc' ? 'desc' : 'asc';
  state.sort = th.dataset.sort;
  loadCards();
}));

document.getElementById('search').addEventListener('input', (e) => {
  state.search = e.target.value.trim();
  loadCards();
});

document.getElementById('filter-type').addEventListener('change', (e) => {
  state.type = e.target.value;
  loadCards();
});

loadTypes().then(loadCards).catch(showErrors);
