import './config/env' // .env dosyasını yükler ve JWT_SECRET kontrolünü uygulama başlamadan önce çalıştırır
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
const isProduction = process.env.NODE_ENV === 'production'

// ALLOWED_ORIGINS, virgülle ayrılmış origin listesi olarak .env dosyasından okunur
// (örn. "https://typing.example.com,https://www.typing.example.com").
// Production'da bu değer tanımlı değilse, varsayılan olarak hiçbir origin'e izin
// verilmez; tüm origin'lere açık CORS (cors()) production'da güvenlik riskidir.
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean)

app.use(
  cors(
    allowedOrigins && allowedOrigins.length > 0
      ? { origin: allowedOrigins }
      : isProduction
        ? { origin: false }
        : undefined,
  ),
)
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
