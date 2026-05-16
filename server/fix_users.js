const db = require('./src/database/connection');
db('users').update({ is_active: 1 }).then(() => {
  console.log('All users have been activated.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
