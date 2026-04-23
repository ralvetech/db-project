import pool from '../../db.ts'

export interface SearchHistory {
  id?: number
  auth0_id: string
  email: string
  place_id: string
  station_name: string
  query_text: string
  lat: number
  lng: number
  searched_at?: Date
}

export async function saveSearchHistory(
  auth0_id: string,
  email: string,
  place_id: string,
  station_name: string,
  query_text: string,
  lat: number,
  lng: number
): Promise<void> {
  await pool.query(
    `INSERT INTO search_history (auth0_id, email, place_id, station_name, query_text, lat, lng)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [auth0_id, email, place_id, station_name, query_text, lat, lng]
  )
}

export async function getAllSearchHistory(): Promise<SearchHistory[]> {
  const [rows] = await pool.query(
    'SELECT * FROM search_history ORDER BY searched_at DESC'
  )
  return rows as SearchHistory[]
}

export async function getSearchHistoryByUser(auth0_id: string): Promise<SearchHistory[]> {
  const [rows] = await pool.query(
    'SELECT * FROM search_history WHERE auth0_id = ? ORDER BY searched_at DESC',
    [auth0_id]
  )
  return rows as SearchHistory[]
}

export async function getMostSearchedStations(): Promise<{ station_name: string; place_id: string; search_count: number }[]> {
  const [rows] = await pool.query(`
    SELECT station_name, place_id, COUNT(*) AS search_count
    FROM search_history
    GROUP BY place_id, station_name
    ORDER BY search_count DESC
    LIMIT 10
  `)
  return rows as { station_name: string; place_id: string; search_count: number }[]
}