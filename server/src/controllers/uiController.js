const db = require('../database/connection');

const getNotifications = async (req, res, next) => {
  try {
    const overdueOrders = await db('orders as o')
      .join('customers as c', 'o.customer_id', 'c.id')
      .select(
        'o.id',
        'o.order_number',
        'o.planned_date',
        'c.name as customer_name'
      )
      .whereNotIn('o.status', ['завершён', 'отгружен', 'отклонён'])
      .whereRaw("julianday(o.planned_date) < julianday('now')")
      .orderBy('o.planned_date', 'asc')
      .limit(5);

    const lowStock = await db('warehouse as w')
      .join('materials as m', function joinMaterial() {
        this.on('w.item_type', db.raw("'material'")).andOn('w.item_id', 'm.id');
      })
      .select('m.id', 'm.name', 'm.article', 'm.min_stock', 'w.quantity', 'w.reserved')
      .whereRaw('(w.quantity - w.reserved) <= m.min_stock')
      .orderBy('m.name', 'asc')
      .limit(5);

    const notifications = [
      ...overdueOrders.map((item) => ({
        id: `order-overdue-${item.id}`,
        level: 'warning',
        title: `Просрочен заказ ${item.order_number}`,
        message: `${item.customer_name}. Плановая дата: ${item.planned_date || 'не указана'}`,
        link: '/orders',
        created_at: new Date().toISOString()
      })),
      ...lowStock.map((item) => ({
        id: `stock-low-${item.id}`,
        level: 'danger',
        title: `Низкий остаток: ${item.name}`,
        message: `Доступно: ${Number(item.quantity) - Number(item.reserved)} (мин. ${item.min_stock})`,
        link: '/warehouse',
        created_at: new Date().toISOString()
      }))
    ];

    res.json({
      notifications,
      unread_count: notifications.length
    });
  } catch (error) {
    next(error);
  }
};

const globalSearch = async (req, res, next) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.json({ query, results: [] });
    }

    const likeQuery = `%${query}%`;

    const [orders, customers, products] = await Promise.all([
      db('orders as o')
        .leftJoin('customers as c', 'o.customer_id', 'c.id')
        .select(
          'o.id',
          'o.order_number',
          'c.name as customer_name',
          'o.status'
        )
        .where((builder) => {
          builder.where('o.order_number', 'like', likeQuery).orWhere('c.name', 'like', likeQuery);
        })
        .limit(5),
      db('customers')
        .select('id', 'name', 'contact_person')
        .where('name', 'like', likeQuery)
        .orWhere('contact_person', 'like', likeQuery)
        .limit(5),
      db('products')
        .select('id', 'name', 'article')
        .where('name', 'like', likeQuery)
        .orWhere('article', 'like', likeQuery)
        .limit(5)
    ]);

    const results = [
      ...orders.map((item) => ({
        id: `order-${item.id}`,
        entity: 'order',
        title: item.order_number,
        description: `${item.customer_name || 'Клиент не указан'} · ${item.status}`,
        link: '/orders'
      })),
      ...customers.map((item) => ({
        id: `customer-${item.id}`,
        entity: 'customer',
        title: item.name,
        description: item.contact_person || 'Контакт не указан',
        link: '/customers'
      })),
      ...products.map((item) => ({
        id: `product-${item.id}`,
        entity: 'product',
        title: item.name,
        description: item.article || 'Артикул не указан',
        link: '/products'
      }))
    ];

    res.json({ query, results });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  globalSearch
};
