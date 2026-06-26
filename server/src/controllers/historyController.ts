import { Response } from 'express'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import { AuthRequest } from '../middlewares/auth'
import { pool } from '../config/db'
import { diffText } from '../utils/diffText'
import { getReachedExpectedText } from '../utils/evaluateExamRules'
import { calculateTypingResult } from '../utils/calculateMetrics'

const VALID_DURATIONS = [1, 3, 5, 7, 10]
// Fiziksel olarak ulaşılabilecek en üst sınır (anti-bot / sahte istek koruması).
// 10 dakikada dahi insan üstü bir hız olan ~25 vuruş/sn baz alınmıştır.
const MAX_PLAUSIBLE_KEYSTROKES_PER_SECOND = 25

export const saveHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Yetkisiz erişim.' })
    }

    const { text_id, duration_minutes, elapsed_seconds, input_value, total_keystrokes } = req.body

    if (
      text_id === undefined ||
      typeof input_value !== 'string' ||
      typeof elapsed_seconds !== 'number' ||
      !Number.isFinite(elapsed_seconds) ||
      elapsed_seconds <= 0
    ) {
      return res.status(400).json({ error: 'Geçersiz istek verisi.' })
    }

    if (!VALID_DURATIONS.includes(Number(duration_minutes))) {
      return res.status(400).json({ error: 'Geçersiz sınav süresi.' })
    }

    // Hedef metni istemciden değil, doğrudan veritabanından alıyoruz.
    const [texts] = await pool.query<RowDataPacket[]>('SELECT content FROM texts WHERE id = ?', [text_id])
    if (texts.length === 0) {
      return res.status(404).json({ error: 'Metin bulunamadı.' })
    }
    const targetText: string = texts[0].content

    const maxDurationSeconds = Number(duration_minutes) * 60
    // Süre, beklenenden makul bir toleransın (5 sn) ötesine geçemez.
    if (elapsed_seconds > maxDurationSeconds + 5) {
      return res.status(400).json({ error: 'Geçersiz süre bilgisi.' })
    }

    const totalKeystrokes =
      typeof total_keystrokes === 'number' && Number.isFinite(total_keystrokes) && total_keystrokes >= 0
        ? total_keystrokes
        : input_value.length

    if (totalKeystrokes > elapsed_seconds * MAX_PLAUSIBLE_KEYSTROKES_PER_SECOND) {
      return res.status(400).json({ error: 'Geçersiz vuruş sayısı.' })
    }

    // Sonuç, istemciden gelen değerler değil, sunucuda yeniden hesaplanan
    // değerler kullanılarak kaydedilir. Böylece istemci tarafı manipülasyonla
    // sahte skor/istatistik kaydedilmesi engellenir.
    const trimmedInput = input_value.trimEnd()
    const evaluatedTargetText = getReachedExpectedText(targetText, trimmedInput)
    const segments = diffText(evaluatedTargetText, trimmedInput)
    const result = calculateTypingResult(
      evaluatedTargetText,
      trimmedInput,
      Math.max(elapsed_seconds, 1),
      segments,
      totalKeystrokes,
    )

    const mistyped_words_json = result.mistypedWords.length > 0 ? JSON.stringify(result.mistypedWords) : null

    const [insertResult] = await pool.query<ResultSetHeader>(
      `INSERT INTO test_history (
        user_id, text_id, duration_minutes, accuracy, total_keystrokes,
        keystrokes_per_minute, correct_words, word_error_count, skipped_words,
        is_failed_by_skipped_words, extra_space_errors, has_incomplete_last_word,
        correct_chars, incorrect_chars, missed_chars, extra_chars,
        elapsed_seconds, expected_comparable_chars, actual_comparable_chars, input_value,
        mistyped_words_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, text_id, duration_minutes, result.accuracy, result.totalKeystrokes,
        result.keystrokesPerMinute, result.correctWords, result.wordErrorCount, result.skippedWords,
        result.isFailedBySkippedWords ? 1 : 0, result.extraSpaceErrors, result.hasIncompleteLastWord ? 1 : 0,
        result.correctChars, result.incorrectChars, result.missedChars, result.extraChars,
        result.elapsedSeconds, result.expectedComparableChars, result.actualComparableChars, input_value,
        mistyped_words_json
      ]
    )

    res.status(201).json({ message: 'Geçmiş kaydedildi.', id: insertResult.insertId })
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
    const [rows] = await pool.query<RowDataPacket[]>(
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
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT duration_minutes FROM test_history WHERE user_id = ? AND text_id = ? ORDER BY duration_minutes ASC`,
      [userId, textId]
    )

    res.json(rows.map((r) => r.duration_minutes))
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

    const [history] = await pool.query<RowDataPacket[]>(
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
