import fs from 'node:fs/promises'
import mysql from 'mysql2/promise'

async function fixDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'typing'
  });

  console.log('Connected to DB');

  await connection.query('DELETE FROM texts WHERE category_id = 3');
  console.log('Deleted corrupted texts');

  const sql = await fs.readFile('../insert_texts.sql', 'utf8');
  
  const connectionMulti = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'typing',
    multipleStatements: true
  });
  
  await connectionMulti.query(sql);
  console.log('Inserted correct texts');
  
  await connection.end();
  await connectionMulti.end();
}

fixDb().catch(console.error);
