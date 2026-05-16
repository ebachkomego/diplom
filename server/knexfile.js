require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'database.sqlite')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'database', 'seeds')
    }
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: 'postgresql://postgres.ezcvpwwueqkqfnjtwyra:StOk9y7L22wdQMwE@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: path.join(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'database', 'seeds')
    }
  }
};
