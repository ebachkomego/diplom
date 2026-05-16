// Контроллер складского учёта
const db = require('../database/connection');

// Общий список остатков с данными о номенклатуре
const getAll = async (req, res, next) => {
  try {
    const materials = await getMaterialsQuery();
    const products = await getProductsQuery();
    res.json({ materials, products });
  } catch (error) { next(error); }
};

// Остатки материалов
const getMaterialsQuery = () =>
  db('warehouse as w')
    .join('materials as m', function() {
      this.on('w.item_type', db.raw("'material'")).andOn('w.item_id', 'm.id');
    })
    .select(
      'w.*', 'm.name', 'm.article', 'm.unit', 'm.min_stock', 'm.price', 'm.category',
      db.raw('(w.quantity - w.reserved) as available'),
      db.raw('CASE WHEN (w.quantity - w.reserved) <= m.min_stock THEN 1 ELSE 0 END as is_low_stock')
    )
    .orderBy('m.name');

// Остатки готовой продукции
const getProductsQuery = () =>
  db('warehouse as w')
    .join('products as p', function() {
      this.on('w.item_type', db.raw("'product'")).andOn('w.item_id', 'p.id');
    })
    .select(
      'w.*', 'p.name', 'p.article', 'p.unit', 'p.price', 'p.category',
      db.raw('(w.quantity - w.reserved) as available')
    )
    .orderBy('p.name');

const getMaterials = async (req, res, next) => {
  try {
    const data = await getMaterialsQuery();
    res.json(data);
  } catch (error) { next(error); }
};

const getProducts = async (req, res, next) => {
  try {
    const data = await getProductsQuery();
    res.json(data);
  } catch (error) { next(error); }
};

// Позиции с критическим уровнем остатков
const getLowStock = async (req, res, next) => {
  try {
    const data = await db('warehouse as w')
      .join('materials as m', function() {
        this.on('w.item_type', db.raw("'material'")).andOn('w.item_id', 'm.id');
      })
      .select('w.*', 'm.name', 'm.article', 'm.unit', 'm.min_stock', 'm.category')
      .whereRaw('(w.quantity - w.reserved) <= m.min_stock');
    res.json(data);
  } catch (error) { next(error); }
};

// Приход товара на склад
const receive = async (req, res, next) => {
  try {
    const { item_type, item_id, quantity, location } = req.body;
    if (!item_type || !item_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Укажите тип, ID и количество > 0' });
    }

    const stock = await db('warehouse').where({ item_type, item_id }).first();

    if (stock) {
      await db('warehouse').where({ item_type, item_id }).update({
        quantity: db.raw('quantity + ?', [quantity]),
        updated_at: new Date().toISOString()
      });
    } else {
      await db('warehouse').insert({ item_type, item_id, quantity, reserved: 0, location });
    }

    res.json({ message: `Приход ${quantity} единиц оформлен` });
  } catch (error) { next(error); }
};

// Расход товара со склада
const issue = async (req, res, next) => {
  try {
    const { item_type, item_id, quantity } = req.body;
    if (!item_type || !item_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Укажите тип, ID и количество > 0' });
    }

    const stock = await db('warehouse').where({ item_type, item_id }).first();
    if (!stock) return res.status(404).json({ error: 'Позиция не найдена на складе' });

    const available = stock.quantity - stock.reserved;
    if (available < quantity) {
      return res.status(400).json({ error: `Недостаточно на складе. Доступно: ${available}` });
    }

    await db('warehouse').where({ item_type, item_id }).update({
      quantity: db.raw('quantity - ?', [quantity]),
      updated_at: new Date().toISOString()
    });

    res.json({ message: `Расход ${quantity} единиц оформлен` });
  } catch (error) { next(error); }
};

module.exports = { getAll, getMaterials, getProducts, getLowStock, receive, issue };
