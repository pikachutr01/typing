import express from 'express'
import { authenticateToken } from '../middlewares/auth'
import { getUserStats } from '../controllers/userController'

const router = express.Router()

router.get('/stats', authenticateToken, getUserStats)

export default router
