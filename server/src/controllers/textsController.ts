import { Request, Response } from 'express'
import { pool } from '../config/db'

export const getCategories = async (req: Request, res: Response) => {
  try {
    const [categories]: any = await pool.query('SELECT * FROM categories ORDER BY id ASC')
    res.json(categories)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Kategoriler alınırken hata oluştu.' })
  }
}

export const getTextsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params
    const [texts]: any = await pool.query('SELECT * FROM texts WHERE category_id = ? ORDER BY id ASC', [categoryId])
    res.json(texts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Metinler alınırken hata oluştu.' })
  }
}

export const getAllTexts = async (req: Request, res: Response) => {
  try {
    const [texts]: any = await pool.query('SELECT texts.*, categories.name as category_name FROM texts JOIN categories ON texts.category_id = categories.id ORDER BY texts.id ASC')
    res.json(texts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Metinler alınırken hata oluştu.' })
  }
}
