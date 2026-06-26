import { Request, Response } from 'express'
import { RowDataPacket } from 'mysql2'
import { pool } from '../config/db'

export const getCategories = async (req: Request, res: Response) => {
  try {
    const [categories] = await pool.query<RowDataPacket[]>('SELECT * FROM categories ORDER BY id ASC')
    res.json(categories)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Kategoriler alınırken hata oluştu.' })
  }
}

export const getTextsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params
    const [texts] = await pool.query<RowDataPacket[]>(`
      SELECT 
        texts.id, 
        text_categories.display_title as title, 
        texts.content, 
        texts.created_at 
      FROM texts 
      JOIN text_categories ON texts.id = text_categories.text_id 
      WHERE text_categories.category_id = ? 
      ORDER BY text_categories.sort_order ASC, texts.id ASC
    `, [categoryId])
    res.json(texts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Metinler alınırken hata oluştu.' })
  }
}

export const getAllTexts = async (req: Request, res: Response) => {
  try {
    const [texts] = await pool.query<RowDataPacket[]>(`
      SELECT 
        texts.id, 
        text_categories.display_title as title, 
        texts.content, 
        texts.created_at, 
        categories.name as category_name 
      FROM texts 
      JOIN text_categories ON texts.id = text_categories.text_id 
      JOIN categories ON text_categories.category_id = categories.id 
      ORDER BY text_categories.sort_order ASC, texts.id ASC
    `)
    res.json(texts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Metinler alınırken hata oluştu.' })
  }
}
