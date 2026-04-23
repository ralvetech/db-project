import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import pool from '../../db.ts'
import {
  getStats,
  getUsers,
  deleteUser,
  getStations,
  deleteStation,
  getSearchHistory,
} from '../controllers/AdminDashboard.ts'

const router = Router()

// ── Admin auth middleware ─────────────────────────────────────────────────────

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth0_id = req.query.auth0_id as string || req.body?.auth0_id
  if (!auth0_id) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  const [rows] = await pool.query(
    'SELECT id FROM admins WHERE auth0_id = ? LIMIT 1',
    [auth0_id]
  ) as any
  if (!rows.length) {
    res.status(403).json({ error: 'Forbidden: not an admin' })
    return
  }
  next()
}

// ── Routes ────────────────────────────────────────────────────────────────────

router.get('/stats',          requireAdmin, getStats)
router.get('/users',          requireAdmin, getUsers)
router.delete('/users/:auth0_id', requireAdmin, deleteUser)
router.get('/stations',       requireAdmin, getStations)
router.delete('/stations/:place_id', requireAdmin, deleteStation)
router.get('/search-history', requireAdmin, getSearchHistory)

export default router