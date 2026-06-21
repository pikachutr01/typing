import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Erişim engellendi, yetkisiz kullanıcı.' })
  }

  if (req.user.username !== 'admin') {
    return res.status(403).json({ error: 'Bu işlem için yönetici yetkisi gereklidir.' })
  }

  next()
}
