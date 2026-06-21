import { Router } from 'express'
import { register, login } from '../controllers/authController'
import { authLimiter } from '../middlewares/rateLimit'

const router = Router()

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)

export default router
