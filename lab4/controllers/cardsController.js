const TechCard = require('../models/TechCard');

const SORT_FIELDS = ['detail', 'processingType', 'duration', 'createdAt'];
const pick = ({ detail, processingType, duration }) => ({ detail, processingType, duration });

// GET /api/cards?search=&type=&sort=duration&order=desc
async function getAll(req, res, next) {
  try {
    const { search, type, sort = 'createdAt', order = 'asc' } = req.query;
    const filter = {};
    if (search) filter.detail = { $regex: escapeRegex(search), $options: 'i' };
    if (type) filter.processingType = type;
    const sortField = SORT_FIELDS.includes(sort) ? sort : 'createdAt';
    const cards = await TechCard.find(filter).sort({ [sortField]: order === 'desc' ? -1 : 1 });
    res.json(cards);
  } catch (e) {
    next(e);
  }
}

// GET /api/cards/:id
async function getOne(req, res, next) {
  try {
    const card = await TechCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Технологічну карту не знайдено' });
    res.json(card);
  } catch (e) {
    next(e);
  }
}

// POST /api/cards
async function create(req, res, next) {
  try {
    const card = await TechCard.create(pick(req.body));
    res.status(201).location(`/api/cards/${card._id}`).json(card);
  } catch (e) {
    next(e);
  }
}

// PUT /api/cards/:id
async function update(req, res, next) {
  try {
    const card = await TechCard.findByIdAndUpdate(req.params.id, pick(req.body),
      { new: true, runValidators: true });
    if (!card) return res.status(404).json({ message: 'Технологічну карту не знайдено' });
    res.json(card);
  } catch (e) {
    next(e);
  }
}

// DELETE /api/cards/:id
async function remove(req, res, next) {
  try {
    const card = await TechCard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ message: 'Технологічну карту не знайдено' });
    res.json({ message: 'Технологічну карту видалено', card });
  } catch (e) {
    next(e);
  }
}

// GET /api/processing-types
function getTypes(req, res) {
  res.json(TechCard.PROCESSING_TYPES);
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { getAll, getOne, create, update, remove, getTypes };
