import type { Request, Response } from 'express'
import pool from '../../db.ts'

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function getStats(req: Request, res: Response) {
  try {
    const [[{ totalUsers }]] = await pool.query(
      'SELECT COUNT(*) AS totalUsers FROM users'
    ) as any

    const [[{ totalStations }]] = await pool.query(
      'SELECT COUNT(*) AS totalStations FROM station_status'
    ) as any

    const [[{ availableStations }]] = await pool.query(
      'SELECT COUNT(*) AS availableStations FROM station_status WHERE has_fuel = 1'
    ) as any

    const [[{ unavailableStations }]] = await pool.query(
      'SELECT COUNT(*) AS unavailableStations FROM station_status WHERE has_fuel = 0'
    ) as any

    const [[{ totalSearches }]] = await pool.query(
      'SELECT COUNT(*) AS totalSearches FROM search_history'
    ) as any

    const [recentSearches] = await pool.query(
      `SELECT email, station_name, searched_at 
       FROM search_history 
       ORDER BY searched_at DESC 
       LIMIT 5`
    ) as any

    const [recentUsers] = await pool.query(
      `SELECT email, username, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT 5`
    ) as any

    res.json({
      totalUsers,
      totalStations,
      availableStations,
      unavailableStations,
      totalSearches,
      recentSearches,
      recentUsers,
    })
  } catch (err) {
    console.error('[admin/stats]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUsers(req: Request, res: Response) {
  try {
    const search = req.query.search as string ?? ''
    const page   = parseInt(req.query.page as string ?? '1')
    const limit  = 20
    const offset = (page - 1) * limit

    let where = 'WHERE 1=1'
    const params: any[] = []

    if (search) {
      where += ' AND (email LIKE ? OR username LIKE ?)'
      const like = `%${search}%`
      params.push(like, like)
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users ${where}`, params
    ) as any

    const [users] = await pool.query(
      `SELECT id, auth0_id, email, username, created_at
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    ) as any

    res.json({ users, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[admin/users]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    await pool.query('DELETE FROM users WHERE auth0_id = ?', [req.params.auth0_id])
    res.json({ success: true })
  } catch (err) {
    console.error('[admin/users DELETE]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ── Stations ──────────────────────────────────────────────────────────────────

export async function getStations(req: Request, res: Response) {
  try {
    const search = req.query.search as string ?? ''
    const status = req.query.status as string ?? ''
    const page   = parseInt(req.query.page as string ?? '1')
    const limit  = 20
    const offset = (page - 1) * limit

    let where = 'WHERE 1=1'
    const params: any[] = []

    if (search) {
      where += ' AND name LIKE ?'
      params.push(`%${search}%`)
    }
    if (status === 'available')   { where += ' AND has_fuel = 1' }
    if (status === 'unavailable') { where += ' AND has_fuel = 0' }
    if (status === 'unknown')     { where += ' AND has_fuel IS NULL' }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM station_status ${where}`, params
    ) as any

    const [stations] = await pool.query(
      `SELECT * FROM station_status ${where}
       ORDER BY updated_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    ) as any

    res.json({ stations, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[admin/stations]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function deleteStation(req: Request, res: Response) {
  try {
    await pool.query('DELETE FROM station_status WHERE place_id = ?', [req.params.place_id])
    res.json({ success: true })
  } catch (err) {
    console.error('[admin/stations DELETE]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ── Search history ────────────────────────────────────────────────────────────

export async function getSearchHistory(req: Request, res: Response) {
  try {
    const page   = parseInt(req.query.page as string ?? '1')
    const limit  = 20
    const offset = (page - 1) * limit

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM search_history'
    ) as any

    const [history] = await pool.query(
      `SELECT * FROM search_history ORDER BY searched_at DESC
       LIMIT ${limit} OFFSET ${offset}`
    ) as any

    const [topStations] = await pool.query(
      `SELECT station_name, place_id, COUNT(*) AS search_count
       FROM search_history
       GROUP BY place_id, station_name
       ORDER BY search_count DESC
       LIMIT 10`
    ) as any

    res.json({ history, total, page, pages: Math.ceil(total / limit), topStations })
  } catch (err) {
    console.error('[admin/search-history]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}