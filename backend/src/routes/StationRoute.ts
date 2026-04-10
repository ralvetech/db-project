import express from 'express'
import { getStationStatuses, updateStationStatus } from '../controllers/stationController.ts'

const router = express.Router()

router.get('/', getStationStatuses)
router.post('/', updateStationStatus)

export default router