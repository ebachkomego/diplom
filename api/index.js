const app = require('../server/app.js');
const knex = require('../server/src/database/connection');

// Run migrations automatically on every cold start
// This ensures PostgreSQL sequences stay in sync after seed data is loaded
knex.migrate.latest()
  .then(() => console.log('✅ DB migrations applied'))
  .catch(err => console.error('⚠️ Migration error (non-fatal):', err.message));

module.exports = app;
