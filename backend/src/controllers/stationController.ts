import type { Request, Response } from 'express'
import { getAllStationStatuses, upsertStationStatus } from '../models/stationStatus.ts'

export async function getStationStatuses(req: Request, res: Response) {
  try {
    const statuses = await getAllStationStatuses()
    // convert to a map of place_id -> status for easy frontend lookup
    const statusMap: Record<string, { has_fuel: boolean | null; updated_by_email: string; updated_at: Date }> = {}
    for (const s of statuses) {
      statusMap[s.place_id] = {
        has_fuel: s.has_fuel,
        updated_by_email: s.updated_by_email!,
        updated_at: s.updated_at!,
      }
    }
    res.json(statusMap)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to get station statuses' })
  }
}

export async function updateStationStatus(req: Request, res: Response) {
  try {
    const { place_id, name, lat, lng, has_fuel, auth0_id, email } = req.body as {
      place_id: string
      name: string
      lat: number
      lng: number
      has_fuel: boolean
      auth0_id: string
      email: string
    }

    if (!place_id || !auth0_id || !email) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    await upsertStationStatus(place_id, name, lat, lng, has_fuel, auth0_id, email)
    res.json({ success: true })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to update station status' })
  }
}