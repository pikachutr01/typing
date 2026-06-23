import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import { pool } from '../config/db'

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Yetkisiz erişim.' })
    }

    // Overall stats grouped by duration
    const [overallRows]: any = await pool.query(`
      SELECT 
        duration_minutes,
        COUNT(*) as total_tests,
        AVG(keystrokes_per_minute) as avg_wpm,
        AVG(accuracy) as avg_accuracy,
        SUM(total_keystrokes) as total_keystrokes,
        MAX(keystrokes_per_minute) as best_wpm,
        AVG(correct_words) as avg_correct_words,
        MAX(correct_words) as best_correct_words
      FROM test_history 
      WHERE user_id = ?
      GROUP BY duration_minutes
      ORDER BY duration_minutes ASC
    `, [userId])

    // Recent history (last 30 per duration)
    const [historyRows]: any = await pool.query(`
      SELECT * FROM (
        SELECT 
          th.id, th.duration_minutes, th.keystrokes_per_minute, th.accuracy, th.correct_words, th.created_at, t.title as text_title,
          ROW_NUMBER() OVER(PARTITION BY th.duration_minutes ORDER BY th.created_at DESC) as rn
        FROM test_history th
        JOIN texts t ON th.text_id = t.id
        WHERE th.user_id = ?
      ) sub
      WHERE rn <= 30
      ORDER BY duration_minutes ASC, created_at ASC
    `, [userId])

    // Best tests per duration
    const [bestTestRows]: any = await pool.query(`
      SELECT * FROM (
        SELECT 
          th.id, th.duration_minutes, th.keystrokes_per_minute, th.accuracy, th.correct_words, th.word_error_count, th.total_keystrokes, th.input_value, th.created_at, 
          t.title as text_title, t.content as target_text,
          ROW_NUMBER() OVER(PARTITION BY th.duration_minutes ORDER BY th.correct_words DESC, th.accuracy DESC) as rn
        FROM test_history th
        JOIN texts t ON th.text_id = t.id
        WHERE th.user_id = ?
      ) sub
      WHERE rn = 1
    `, [userId])

    // Mistyped words
    const [mistypedRows]: any = await pool.query(`
      SELECT mistyped_words_json
      FROM test_history
      WHERE user_id = ? AND mistyped_words_json IS NOT NULL
    `, [userId])

    const mistypedWordCounts: Record<string, number> = {}
    mistypedRows.forEach((row: any) => {
      try {
        const words = JSON.parse(row.mistyped_words_json)
        if (Array.isArray(words)) {
          words.forEach(word => {
            mistypedWordCounts[word] = (mistypedWordCounts[word] || 0) + 1
          })
        }
      } catch (e) {
        // ignore invalid json
      }
    })

    const topMistypedWords = Object.entries(mistypedWordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50)

    res.json({
      overall: overallRows,
      history: historyRows,
      bestTests: bestTestRows,
      topMistypedWords
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({ error: 'İstatistikler alınırken hata oluştu.' })
  }
}
