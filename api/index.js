const app = require('../server/app.js');
const knex = require('../server/src/database/connection');

// Fire-and-forget migration on cold start
knex.migrate.latest()
  .then(() => console.log('✅ Migrations applied'))
  .catch(err => console.error('⚠️ Migration error:', err.message));

module.exports = app;
