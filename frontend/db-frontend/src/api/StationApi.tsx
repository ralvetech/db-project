import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { toast } from 'sonner'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface StationStatusMap {
  [place_id: string]: {
    has_fuel: boolean | null
    updated_by_email: string
    updated_at: string
  }
}

export const useGetStationStatuses = () => {
  const { data: statuses, isPending } = useQuery({
    queryKey: ['stationStatuses'],
    queryFn: async (): Promise<StationStatusMap> => {
      const res = await fetch(`${API_BASE_URL}/api/stations`)
      if (!res.ok) throw new Error('Failed to fetch statuses')
      return res.json()
    },
    refetchInterval: 10000,
  })
  return { statuses, isPending }
}

export const useUpdateStationStatus = () => {
  const { user } = useAuth0();
  const queryClient = useQueryClient() ;

  const { mutateAsync: updateStatus, isPending } = useMutation({
    mutationFn: async (data: {
      place_id: string
      name: string
      lat: number
      lng: number
      has_fuel: boolean
    }) => {
      const res = await fetch(`${API_BASE_URL}/api/stations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          auth0_id: user?.sub,
          email: user?.email,
        }),
      })
      if (!res.ok) throw new Error('Failed to update status')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stationStatuses'] }) // ✅ refetch immediately after update
      toast.success('Station status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update station status');
    }
  })

  return { updateStatus, isPending }
}