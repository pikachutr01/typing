import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' })
    }

    const [existingUsers]: any = await pool.query('SELECT * FROM users WHERE username = ?', [username])
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Bu kullanıcı adı zaten alınmış.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const [result]: any = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    )

    const token = jwt.sign({ id: result.insertId, username }, JWT_SECRET, { expiresIn: '365d' })

    res.status(201).json({ message: 'Kayıt başarılı', token, user: { id: result.insertId, username } })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Sunucu hatası.' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' })
    }

    const [users]: any = await pool.query('SELECT * FROM users WHERE username = ?', [username])
    if (users.length === 0) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı veya şifre hatalı.' })
    }

    const user = users[0]
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı veya şifre hatalı.' })
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '365d' })

    res.json({ message: 'Giriş başarılı', token, user: { id: user.id, username: user.username } })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Sunucu hatası.' })
  }
}
