import type { Request, Response } from 'express'
import {
  getMonthlyPetrolAvailability,
  getMostActiveUsers,
  getMostUnavailableStations,
  getRecentStatusUpdates,
} from '../models/AdminReports.ts'

export async function getAdminReports(req: Request, res: Response) {
  try {
    const [
      monthlyAvailability,
      mostActiveUsers,
      mostUnavailableStations,
      recentStatusUpdates,
    ] = await Promise.all([
      getMonthlyPetrolAvailability(),
      getMostActiveUsers(),
      getMostUnavailableStations(),
      getRecentStatusUpdates(),
    ])

    res.json({
      monthlyAvailability,
      mostActiveUsers,
      mostUnavailableStations,
      recentStatusUpdates,
    })
  } catch (error) {
    console.error('Error fetching admin reports:', error)
    res.status(500).json({ error: 'Failed to fetch admin reports' })
  }
}