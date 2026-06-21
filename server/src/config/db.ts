import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'typing',
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
