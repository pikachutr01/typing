import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import { pool } from '../config/db'

export const saveHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Yetkisiz erişim.' })
    }

    const {
      text_id,
      duration_minutes,
      accuracy,
      total_keystrokes,
      keystrokes_per_minute,
      correct_words,
      word_error_count,
      skipped_words,
      is_failed_by_skipped_words,
      extra_space_errors,
      has_incomplete_last_word,
      correct_chars,
      incorrect_chars,
      missed_chars,
      extra_chars,
      elapsed_seconds,
      expected_comparable_chars,
      actual_comparable_chars,
      input_value
    } = req.body

    const [result]: any = await pool.query(
      `INSERT INTO test_history (
        user_id, text_id, duration_minutes, accuracy, total_keystrokes,
        keystrokes_per_minute, correct_words, word_error_count, skipped_words,
        is_failed_by_skipped_words, extra_space_errors, has_incomplete_last_word,
        correct_chars, incorrect_chars, missed_chars, extra_chars,
        elapsed_seconds, expected_comparable_chars, actual_comparable_chars, input_value
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, text_id, duration_minutes, accuracy, total_keystrokes,
        keystrokes_per_minute, correct_words, word_error_count, skipped_words,
        is_failed_by_skipped_words ? 1 : 0, extra_space_errors, has_incomplete_last_word ? 1 : 0,
        correct_chars, incorrect_chars, missed_chars, extra_chars,
        elapsed_seconds, expected_comparable_chars, actual_comparable_chars, input_value
      ]
    )

    res.status(201).json({ message: 'Geçmiş kaydedildi.', id: result.insertId })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Geçmiş kaydedilirken hata oluştu.' })
  }
}

export const checkHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Yetkisiz erişim.' })

    const textId = req.params.textId
    const [rows]: any = await pool.query(
      `SELECT 1 FROM test_history WHERE user_id = ? AND text_id = ? LIMIT 1`,
      [userId, textId]
    )

    res.json({ hasHistory: rows.length > 0 })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Hata oluştu.' })
  }
}

export const getHistoryDurations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: 'Yetkisiz erişim.' })

    const textId = req.params.textId
    const [rows]: any = await pool.query(
      `SELECT DISTINCT duration_minutes FROM test_history WHERE user_id = ? AND text_id = ? ORDER BY duration_minutes ASC`,
      [userId, textId]
    )

    res.json(rows.map((r: any) => r.duration_minutes))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Hata oluştu.' })
  }
}

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Yetkisiz erişim.' })
    }

    const textId = req.params.textId
    const duration = req.params.durationMinutes
    const limit = parseInt(req.query.limit as string) || 20
    const offset = parseInt(req.query.offset as string) || 0

    const [history]: any = await pool.query(
      `SELECT th.*, t.title as text_title, t.content as original_text 
       FROM test_history th 
       JOIN texts t ON th.text_id = t.id 
       WHERE th.user_id = ? AND th.text_id = ? AND th.duration_minutes = ?
       ORDER BY th.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, textId, duration, limit, offset]
    )

    res.json(history)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Geçmiş alınırken hata oluştu.' })
  }
}
