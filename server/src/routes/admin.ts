import { Router } from 'express'
import { authenticateToken } from '../middlewares/auth'
import { requireAdmin } from '../middlewares/requireAdmin'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getTexts,
  createText,
  updateText,
  deleteText,
  getUsers,
  deleteUser,
  getUserHistory,
  deleteHistory,
  getCategoryTexts,
  assignTextToCategory,
  removeTextFromCategory,
  updateCategoryTextOrder,
  getTextById
} from '../controllers/adminController'

const router = Router()

// All admin routes are protected by these middlewares
router.use(authenticateToken)
router.use(requireAdmin)

// Categories
router.get('/categories', getCategories)
router.post('/categories', createCategory)
router.put('/categories/:id', updateCategory)
router.delete('/categories/:id', deleteCategory)

router.get('/categories/:id/texts', getCategoryTexts)
router.post('/categories/:id/texts', assignTextToCategory)
router.put('/categories/:categoryId/texts/order', updateCategoryTextOrder)
router.delete('/categories/:categoryId/texts/:textId', removeTextFromCategory)

// Texts
router.get('/texts', getTexts)
router.get('/texts/:id', getTextById)
router.post('/texts', createText)
router.put('/texts/:id', updateText)
router.delete('/texts/:id', deleteText)

// Users
router.get('/users', getUsers)
router.delete('/users/:id', deleteUser)

// History
router.get('/users/:userId/history', getUserHistory)
router.delete('/history/:id', deleteHistory)

export default router
