const { Pool } = require('pg');
const { databaseUrl } = require('./env');
// El pool se inicializa solo cuando DATABASE_URL está configurada.
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl, max: 10 }) : null;
module.exports = { pool };
