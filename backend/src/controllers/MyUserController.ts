import type { Request, Response } from 'express'
import { getUserByAuth0Id, deleteUser, createUser, updateUser } from '../models/user.ts'

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const auth0_id = req.query.auth0_id as string;
    if (!auth0_id) return res.status(401).json({ error: 'Unauthorized' })

    const user = await getUserByAuth0Id(auth0_id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json(user)
  } catch {
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export async function createCurrentUser(req: Request, res: Response) {
  try {
    const { auth0_id, email } = req.body as { auth0_id: string; email: string }

    console.log("received data", req.body)

    const existingUser = await getUserByAuth0Id(auth0_id)
    if (existingUser) return res.status(409).json({ error: 'User already exists' })

    const id = await createUser(auth0_id, email)
    res.status(201).json({ id, success: true }) 
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to create user' })
  }
}

export async function updateCurrentUser(req: Request, res: Response) {
  try {
    const { auth0_id, email, username, district, city } = req.body as { auth0_id: string; email?: string, username: string, district: string, city: string }

    const existingUser = await getUserByAuth0Id(auth0_id)
    if (!existingUser) return res.status(404).json({ error: 'User not found' })

    await updateUser(auth0_id, email?? existingUser.email, username, district, city )

    const updatedUser = await getUserByAuth0Id(auth0_id);
    res.json({ success: true })
  } catch (error){
    console.log(error)
    res.status(500).json({ error: 'Failed to update user' })
  }
}

export async function deleteCurrentUser(req: Request, res: Response) {
  try {
    const { auth0_id } = req.body as { auth0_id: string }
    if (!auth0_id) return res.status(401).json({ error: 'Unauthorized' })

    await deleteUser(auth0_id)
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete user.' })
  }
}


export default {
  getCurrentUser,
  createCurrentUser,
  updateCurrentUser,
  deleteCurrentUser
};