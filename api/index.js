const app = require('../server/app.js');
const knex = require('../server/src/database/connection');

// Lazy-init: run migrations BEFORE the first request is processed.
// This guarantees sequences are fixed before any INSERT happens.
let ready = false;
let initPromise = null;

function ensureReady() {
  if (ready) return Promise.resolve();
  if (!initPromise) {
    initPromise = knex.migrate.latest()
      .then(() => {
        ready = true;
        console.log('✅ DB migrations applied (sequences fixed)');
      })
      .catch(err => {
        console.error('⚠️ Migration error:', err.message);
        ready = true; // don't block forever on error
      });
  }
  return initPromise;
}

// Vercel expects a standard (req, res) handler
module.exports = async (req, res) => {
  await ensureReady();
  return app(req, res);
};
