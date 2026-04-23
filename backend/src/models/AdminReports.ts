import pool from '../../db.ts'

export async function getMonthlyPetrolAvailability() {
  const [rows] = await pool.query(`
    SELECT
      DATE_FORMAT(updated_at, '%Y-%m') AS month,
      name AS station_name,
      place_id,
      COUNT(*) AS total_updates,
      SUM(has_fuel = 1) AS available_reports,
      SUM(has_fuel = 0) AS unavailable_reports,
      ROUND((SUM(has_fuel = 1) / COUNT(*)) * 100, 2) AS availability_percentage
    FROM station_status_history
    GROUP BY DATE_FORMAT(updated_at, '%Y-%m'), place_id, name
    ORDER BY month DESC, station_name ASC
  `)

  return rows
}

export async function getMostActiveUsers() {
  const [rows] = await pool.query(`
    SELECT
      updated_by_auth0_id,
      updated_by_email,
      COUNT(*) AS update_count,
      MAX(updated_at) AS last_update
    FROM station_status_history
    WHERE updated_by_auth0_id IS NOT NULL
    GROUP BY updated_by_auth0_id, updated_by_email
    ORDER BY update_count DESC
    LIMIT 10
  `)

  return rows
}

export async function getMostUnavailableStations() {
  const [rows] = await pool.query(`
    SELECT
      place_id,
      name AS station_name,
      COUNT(*) AS unavailable_reports,
      MAX(updated_at) AS last_reported_unavailable
    FROM station_status_history
    WHERE has_fuel = 0
    GROUP BY place_id, name
    ORDER BY unavailable_reports DESC
    LIMIT 10
  `)

  return rows
}

export async function getRecentStatusUpdates() {
  const [rows] = await pool.query(`
    SELECT
      place_id,
      name AS station_name,
      has_fuel,
      updated_by_email,
      updated_at
    FROM station_status_history
    ORDER BY updated_at DESC
    LIMIT 20
  `)

  return rows
}