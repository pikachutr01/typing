import { Router } from 'express'
import { getCategories, getTextsByCategory, getAllTexts } from '../controllers/textsController'

const router = Router()

router.get('/categories', getCategories)
router.get('/all', getAllTexts)
router.get('/category/:categoryId', getTextsByCategory)

export default router
