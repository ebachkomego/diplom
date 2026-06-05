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
    console.log('Testing getAll query...');
    const result = await db('orders as o')
      .join('customers as c', 'o.customer_id', 'c.id')
      .leftJoin('users as u', 'o.created_by', 'u.id')
      .select(
        'o.*',
        'c.name as customer_name',
        'c.contact_person',
        'u.full_name as created_by_name'
      )
      .orderBy('o.created_at', 'desc')
      .limit(5);
    console.log('Query success! Row count:', result.length);
    console.log('Data:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Query error:', err);
  } finally {
    await db.destroy();
  }
}

run();
