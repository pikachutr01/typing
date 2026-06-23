import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import { checkConnection } from './config/db'
import { apiLimiter } from './middlewares/rateLimit'

import authRoutes from './routes/auth'
import textRoutes from './routes/texts'
import historyRoutes from './routes/history'
import adminRoutes from './routes/admin'
import userRoutes from './routes/userRoutes'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/api/auth', apiLimiter, authRoutes)
app.use('/api/texts', apiLimiter, textRoutes)
app.use('/api/history', apiLimiter, historyRoutes)
app.use('/api/user', apiLimiter, userRoutes)
app.use('/api/admin', adminRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`)
  await checkConnection()
})
