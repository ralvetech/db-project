import pool from '../../db.ts'

export interface User {
  id?: number
  auth0_id: string
  username?: string
  email: string
  district?: string
  city?: string
  created_at?: Date
  updated_at?: Date
}

export async function getUserByAuth0Id(auth0_id: string): Promise<User | null> {
  const [rows] = await pool.query('SELECT * FROM users WHERE auth0_id = ?', [auth0_id])
  const users = rows as User[]
  return users[0] ?? null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
  const users = rows as User[]
  return users[0] ?? null
}

export async function createUser(auth0_id: string, email: string): Promise<number> {
  const [result] = await pool.query(
    'INSERT INTO users (auth0_id, email ) VALUES (?, ?)',
    [auth0_id, email]
  )
  const { insertId } = result as { insertId: number }
  return insertId
}

export async function updateUser(auth0_id: string, email: string, username?: string, district?: string, city?: string ): Promise<void> {
  await pool.query(
    'UPDATE users SET email = ?, username = ?, district = ?, city = ? WHERE auth0_id = ?',
    [email, username, district, city, auth0_id]
  )
}
export async function upsertUser(auth0_id: string, email: string, username?: string): Promise<void> {
  await pool.query(
    `INSERT INTO users (auth0_id, email, username) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE email = VALUES(email), username = VALUES(username)`,
    [auth0_id, email, username ?? null]
  )
}

export async function deleteUser(auth0_id: string): Promise<void> {
  await pool.query('DELETE FROM users WHERE auth0_id = ?', [auth0_id])
}