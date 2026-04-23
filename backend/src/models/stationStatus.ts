import pool from '../../db.ts'

export interface StationStatus {
  id?: number
  place_id: string
  name: string
  lat: number
  lng: number
  has_fuel: boolean | null
  updated_by_auth0_id?: string
  updated_by_email?: string
  updated_at?: Date
}

export async function getAllStationStatuses(): Promise<StationStatus[]> {
  const [rows] = await pool.query('SELECT * FROM station_status')
  return rows as StationStatus[]
}

export async function upsertStationStatus(
  place_id: string,
  name: string,
  lat: number,
  lng: number,
  has_fuel: boolean,
  auth0_id: string,
  email: string
): Promise<void> {
  await pool.query(
    `INSERT INTO station_status (place_id, name, lat, lng, has_fuel, updated_by_auth0_id, updated_by_email)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       has_fuel = VALUES(has_fuel),
       updated_by_auth0_id = VALUES(updated_by_auth0_id),
       updated_by_email = VALUES(updated_by_email),
       updated_at = CURRENT_TIMESTAMP`,
    [place_id, name, lat, lng, has_fuel, auth0_id, email]
  )
    await pool.query(
    `
    INSERT INTO station_status_history
      (place_id, name, lat, lng, has_fuel, updated_by_auth0_id, updated_by_email)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [place_id, name, lat, lng, has_fuel, auth0_id, email]
  )
}