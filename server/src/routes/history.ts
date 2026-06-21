import { Router } from 'express'
import { saveHistory, getHistory, checkHistory, getHistoryDurations } from '../controllers/historyController'
import { authenticateToken } from '../middlewares/auth'

const router = Router()

router.post('/', authenticateToken, saveHistory)
router.get('/check/:textId', authenticateToken, checkHistory)
router.get('/durations/:textId', authenticateToken, getHistoryDurations)
router.get('/:textId/:durationMinutes', authenticateToken, getHistory)

export default router
