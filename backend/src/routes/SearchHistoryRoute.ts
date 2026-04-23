import express from 'express'
import { createSearchHistory } from '../controllers/SearchHistory.ts'

const router = express.Router()

router.post('/', createSearchHistory)

export default router