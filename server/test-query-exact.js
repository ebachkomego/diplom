const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    connectionString: 'postgresql://postgres.ezcvpwwueqkqfnjtwyra:StOk9y7L22wdQMwE@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  }
});

async function run() {
  try {
    const page = 1;
    const limit = 50;
    const offset = (page - 1) * limit;

    let query = db('orders as o')
      .join('customers as c', 'o.customer_id', 'c.id')
      .leftJoin('users as u', 'o.created_by', 'u.id')
      .select(
        'o.*',
        'c.name as customer_name',
        'c.contact_person',
        'u.full_name as created_by_name'
      )
      .orderBy('o.created_at', 'desc');

    // Test clearSelect and clearOrder
    const totalQuery = query.clone().clearSelect().clearOrder().count('o.id as count').first();
    const total = await totalQuery;
    console.log('Total count result:', total);

    const orders = await query.limit(parseInt(limit)).offset(offset);
    console.log('Orders result count:', orders.length);
  } catch (err) {
    console.error('Fatal query execution error:', err);
  } finally {
    await db.destroy();
  }
}

run();
