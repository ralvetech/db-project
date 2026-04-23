import type { Request, Response } from 'express'
import { saveSearchHistory } from '../models/Searchistory.ts'

export async function createSearchHistory(req: Request, res: Response) {
  try {
    const {
      auth0_id,
      email,
      place_id,
      station_name,
      query_text,
      lat,
      lng,
    } = req.body as {
      auth0_id: string
      email: string
      place_id: string
      station_name: string
      query_text: string
      lat: number
      lng: number
    }

    if (
      !auth0_id ||
      !email ||
      !place_id ||
      !station_name ||
      !query_text ||
      lat === undefined ||
      lng === undefined
    ) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    await saveSearchHistory(
      auth0_id,
      email,
      place_id,
      station_name,
      query_text,
      lat,
      lng
    )

    res.status(201).json({ message: 'Search history saved successfully' })
  } catch (error) {
    console.error('Error saving search history:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}