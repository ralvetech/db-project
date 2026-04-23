import express from 'express'
import { getAdminReports } from '../controllers/AdminReportsController.ts'

const router = express.Router()

router.get('/', getAdminReports)

export default router