import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'typing_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function checkConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('MySQL bağlantısı başarılı!')
    connection.release()
  } catch (error) {
    console.error('MySQL bağlantı hatası:', error)
  }
}
