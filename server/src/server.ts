import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { checkConnection } from './config/db'
import { apiLimiter } from './middlewares/rateLimit'

import authRoutes from './routes/auth'
import textRoutes from './routes/texts'
import historyRoutes from './routes/history'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(apiLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/texts', textRoutes)
app.use('/api/history', historyRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`)
  await checkConnection()
})
