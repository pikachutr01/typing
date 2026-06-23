import dotenv from 'dotenv'
import { createConnection } from 'mysql2/promise'

dotenv.config({ path: './server/.env' })

async function runMigration() {
  try {
    const connection = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'typing',
    })

    console.log('Veritabanına bağlanıldı...')

    // Check if column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'test_history' AND COLUMN_NAME = 'mistyped_words_json'
    `, [process.env.DB_NAME || 'typing'])

    if (Array.isArray(columns) && columns.length === 0) {
      console.log('Kolon bulunamadı, ekleniyor...')
      await connection.query('ALTER TABLE `test_history` ADD COLUMN `mistyped_words_json` text DEFAULT NULL AFTER `input_value`')
      console.log('mistyped_words_json kolonu başarıyla eklendi!')
    } else {
      console.log('mistyped_words_json kolonu zaten mevcut.')
    }

    await connection.end()
  } catch (err) {
    console.error('Hata oluştu:', err)
  }
}

runMigration()
