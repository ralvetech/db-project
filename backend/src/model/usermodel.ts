import pool from '../../db.ts'

export interface User {
  id: number
  name: string
  email: string
  password: string
  created_at: Date
}

export async function getAllUsers(): Promise<User[]> {
  const [rows] = await pool.query('SELECT * FROM users')
  return rows as User[]
}

export async function getUserById(id: number): Promise<User | null> {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
  const users = rows as User[]
  return users[0] ?? null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
  const users = rows as User[]
  return users[0] ?? null
}

export async function createUser(name: string, email: string, password: string): Promise<number> {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password]
  )
  const { insertId } = result as { insertId: number }
  return insertId
}

export async function updateUser(id: number, name: string, email: string): Promise<void> {
  await pool.query(
    'UPDATE users SET name = ?, email = ? WHERE id = ?',
    [name, email, id]
  )
}

export async function deleteUser(id: number): Promise<void> {
  await pool.query('DELETE FROM users WHERE id = ?', [id])
}