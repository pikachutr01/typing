import { Request, Response } from 'express'
import { pool } from '../config/db'

// Categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const [categories]: any = await pool.query('SELECT * FROM categories ORDER BY id ASC')
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: 'Kategoriler alınırken hata oluştu.' })
  }
}

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body
    const [result]: any = await pool.query('INSERT INTO categories (name) VALUES (?)', [name])
    res.json({ id: result.insertId, name })
  } catch (error) {
    res.status(500).json({ error: 'Kategori eklenirken hata oluştu.' })
  }
}

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name } = req.body
    await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id])
    res.json({ id, name })
  } catch (error) {
    res.status(500).json({ error: 'Kategori güncellenirken hata oluştu.' })
  }
}

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    // This will fail if there are texts associated with it depending on foreign key constraints.
    // It's up to the client to handle the error or we can check first.
    await pool.query('DELETE FROM categories WHERE id = ?', [id])
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Kategori silinirken hata oluştu. Lütfen önce bu kategoriye ait metinleri silin.' })
  }
}

// Texts
export const getTexts = async (req: Request, res: Response) => {
  try {
    const [texts]: any = await pool.query('SELECT texts.*, categories.name as category_name FROM texts JOIN categories ON texts.category_id = categories.id ORDER BY texts.id ASC')
    res.json(texts)
  } catch (error) {
    res.status(500).json({ error: 'Metinler alınırken hata oluştu.' })
  }
}

export const createText = async (req: Request, res: Response) => {
  try {
    const { title, content, category_id } = req.body
    const [result]: any = await pool.query('INSERT INTO texts (title, content, category_id) VALUES (?, ?, ?)', [title, content, category_id])
    res.json({ id: result.insertId, title, content, category_id })
  } catch (error) {
    res.status(500).json({ error: 'Metin eklenirken hata oluştu.' })
  }
}

export const updateText = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, content, category_id } = req.body
    await pool.query('UPDATE texts SET title = ?, content = ?, category_id = ? WHERE id = ?', [title, content, category_id, id])
    res.json({ id, title, content, category_id })
  } catch (error) {
    res.status(500).json({ error: 'Metin güncellenirken hata oluştu.' })
  }
}

export const deleteText = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM texts WHERE id = ?', [id])
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Metin silinirken hata oluştu. Bu metne ait geçmiş test kayıtları olabilir.' })
  }
}

// Users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const [users]: any = await pool.query('SELECT id, username, created_at FROM users ORDER BY id DESC')
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcılar alınırken hata oluştu.' })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (id === '1') return res.status(403).json({ error: 'Ana admin hesabı silinemez.' })
    await pool.query('DELETE FROM users WHERE id = ?', [id])
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı silinirken hata oluştu.' })
  }
}

export const getUserHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const page = parseInt(req.query.page as string) || 0
    const limit = parseInt(req.query.limit as string) || 20
    const offset = page * limit

    const [rows]: any = await pool.query(
      `SELECT h.*, t.title as text_title, t.content as target_text, c.name as category_name
       FROM test_history h
       LEFT JOIN texts t ON h.text_id = t.id
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE h.user_id = ? 
       ORDER BY h.created_at DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    )

    // Count
    const [countRows]: any = await pool.query('SELECT COUNT(*) as count FROM test_history WHERE user_id = ?', [userId])
    const totalCount = countRows[0].count

    res.json({
      data: rows,
      hasMore: offset + rows.length < totalCount
    })
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı geçmişi alınırken hata oluştu.' })
  }
}

export const deleteHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM test_history WHERE id = ?', [id])
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Kayıt silinirken hata oluştu.' })
  }
}
