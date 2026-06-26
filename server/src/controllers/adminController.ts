import { Request, Response } from 'express'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import { pool } from '../config/db'

// Categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const [categories] = await pool.query<RowDataPacket[]>('SELECT * FROM categories ORDER BY id ASC')
    res.json(categories)
  } catch {
    res.status(500).json({ error: 'Kategoriler alınırken hata oluştu.' })
  }
}

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO categories (name) VALUES (?)', [name])
    res.json({ id: result.insertId, name })
  } catch {
    res.status(500).json({ error: 'Kategori eklenirken hata oluştu.' })
  }
}

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name } = req.body
    await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id])
    res.json({ id, name })
  } catch {
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
  } catch {
    res.status(500).json({ error: 'Kategori silinirken hata oluştu. Lütfen önce bu kategoriye ait metinleri silin.' })
  }
}

// Texts
export const getTexts = async (req: Request, res: Response) => {
  try {
    const [texts] = await pool.query<RowDataPacket[]>('SELECT * FROM texts ORDER BY id DESC')
    res.json(texts)
  } catch {
    res.status(500).json({ error: 'Metinler alınırken hata oluştu.' })
  }
}

export const getTextById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const [texts] = await pool.query<RowDataPacket[]>('SELECT * FROM texts WHERE id = ?', [id])
    if (texts.length === 0) return res.status(404).json({ error: 'Metin bulunamadı.' })
    res.json(texts[0])
  } catch {
    res.status(500).json({ error: 'Metin alınırken hata oluştu.' })
  }
}

export const createText = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO texts (title, content) VALUES (?, ?)', [title, content])
    res.json({ id: result.insertId, title, content })
  } catch {
    res.status(500).json({ error: 'Metin eklenirken hata oluştu.' })
  }
}

export const updateText = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, content } = req.body
    await pool.query('UPDATE texts SET title = ?, content = ? WHERE id = ?', [title, content, id])
    res.json({ id, title, content })
  } catch {
    res.status(500).json({ error: 'Metin güncellenirken hata oluştu.' })
  }
}

export const deleteText = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM texts WHERE id = ?', [id])
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Metin silinirken hata oluştu. Bu metne ait geçmiş test kayıtları olabilir.' })
  }
}

export const getCategoryTexts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const [texts] = await pool.query<RowDataPacket[]>(`
      SELECT t.id, t.title as reference_title, tc.display_title, t.content 
      FROM text_categories tc 
      JOIN texts t ON tc.text_id = t.id 
      WHERE tc.category_id = ?
      ORDER BY tc.sort_order ASC, t.id ASC
    `, [id])
    res.json(texts)
  } catch {
    res.status(500).json({ error: 'Kategori metinleri alınırken hata.' })
  }
}

export const assignTextToCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params // categoryId
    const { text_id, display_title } = req.body

    const [maxRow] = await pool.query<RowDataPacket[]>('SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM text_categories WHERE category_id = ?', [id])
    const sort_order = maxRow[0].max_sort + 1

    await pool.query('INSERT INTO text_categories (category_id, text_id, display_title, sort_order) VALUES (?, ?, ?, ?)', [id, text_id, display_title, sort_order])
    res.json({ success: true })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Bu metin zaten bu kategoriye atanmış.' })
    }
    res.status(500).json({ error: 'Metin kategoriye atanırken hata oluştu.' })
  }
}

export const removeTextFromCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId, textId } = req.params
    await pool.query('DELETE FROM text_categories WHERE category_id = ? AND text_id = ?', [categoryId, textId])
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Metin kategoriden çıkarılırken hata oluştu.' })
  }
}

export const updateCategoryTextOrder = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params
    const { orderedTextIds } = req.body

    for (let i = 0; i < orderedTextIds.length; i++) {
      await pool.query('UPDATE text_categories SET sort_order = ? WHERE category_id = ? AND text_id = ?', [i, categoryId, orderedTextIds[i]])
    }
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Sıralama güncellenirken hata oluştu.' })
  }
}

// Users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const [users] = await pool.query<RowDataPacket[]>('SELECT id, username, created_at FROM users ORDER BY id DESC')
    res.json(users)
  } catch {
    res.status(500).json({ error: 'Kullanıcılar alınırken hata oluştu.' })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (id === '1') return res.status(403).json({ error: 'Ana admin hesabı silinemez.' })
    await pool.query('DELETE FROM users WHERE id = ?', [id])
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Kullanıcı silinirken hata oluştu.' })
  }
}

export const getUserHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const page = parseInt(req.query.page as string) || 0
    const limit = parseInt(req.query.limit as string) || 20
    const offset = page * limit

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT h.*, t.title as text_title, t.content as target_text, 
         (SELECT GROUP_CONCAT(c.name SEPARATOR ', ') 
          FROM text_categories tc 
          JOIN categories c ON tc.category_id = c.id 
          WHERE tc.text_id = t.id) as category_name
       FROM test_history h
       LEFT JOIN texts t ON h.text_id = t.id
       WHERE h.user_id = ? 
       ORDER BY h.created_at DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    )

    // Count
    const [countRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM test_history WHERE user_id = ?', [userId])
    const totalCount = countRows[0].count

    res.json({
      data: rows,
      hasMore: offset + rows.length < totalCount
    })
  } catch {
    res.status(500).json({ error: 'Kullanıcı geçmişi alınırken hata oluştu.' })
  }
}

export const deleteHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM test_history WHERE id = ?', [id])
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Kayıt silinirken hata oluştu.' })
  }
}
