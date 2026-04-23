import { useAuth0 } from '@auth0/auth0-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:7000'

function useAdminId() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  console.log('useAdminId - sub:', user?.sub, 'isAuthenticated:', isAuthenticated, 'isLoading:', isLoading)
  return { 
    id: user?.sub ?? '', 
    ready: isAuthenticated && !isLoading && !!user?.sub
  }
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  const { id, ready } = useAdminId()
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/admin/stats?auth0_id=${id}`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
    enabled: ready && !!id,
  })
}

// ── Users ─────────────────────────────────────────────────────────────────────

export function useAdminUsers(search = '', page = 1) {
  const { id, ready } = useAdminId()
  return useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ auth0_id: id, search, page: String(page) })
      const res = await fetch(`${API}/api/admin/users?${params}`)
      if (!res.ok) throw new Error('Failed to fetch users')
      return res.json()
    },
    enabled: ready && !!id,
  })
}

export function useDeleteUser() {
  const { id } = useAdminId()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (auth0_id: string) => {
      const res = await fetch(`${API}/api/admin/users/${auth0_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth0_id: id }),
      })
      if (!res.ok) throw new Error('Failed to delete user')
      return res.json()
    },
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries({ queryKey: ['admin-users'] }) },
    onError:   () => toast.error('Failed to delete user'),
  })
}

// ── Stations ──────────────────────────────────────────────────────────────────

export function useAdminStations(search = '', status = '', page = 1) {
  const { id, ready } = useAdminId()
  return useQuery({
    queryKey: ['admin-stations', search, status, page],
    queryFn: async () => {
      const params = new URLSearchParams({ auth0_id: id, search, status, page: String(page) })
      const res = await fetch(`${API}/api/admin/stations?${params}`)
      if (!res.ok) throw new Error('Failed to fetch stations')
      return res.json()
    },
    enabled: ready && !!id,
  })
}

export function useDeleteStation() {
  const { id } = useAdminId()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (place_id: string) => {
      const res = await fetch(`${API}/api/admin/stations/${place_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth0_id: id }),
      })
      if (!res.ok) throw new Error('Failed to delete station')
      return res.json()
    },
    onSuccess: () => { toast.success('Station deleted'); qc.invalidateQueries({ queryKey: ['admin-stations'] }) },
    onError:   () => toast.error('Failed to delete station'),
  })
}

// ── Search history ────────────────────────────────────────────────────────────

export function useAdminSearchHistory(page = 1) {
  const { id, ready } = useAdminId()
  return useQuery({
    queryKey: ['admin-search-history', page],
    queryFn: async () => {
      const params = new URLSearchParams({ auth0_id: id, page: String(page) })
      const res = await fetch(`${API}/api/admin/search-history?${params}`)
      if (!res.ok) throw new Error('Failed to fetch search history')
      return res.json()
    },
    enabled: ready && !!id,
  })
}

export function useAdminReports() {
  return useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const response = await fetch(`${API}/api/admin/reports`)

      if (!response.ok) {
        throw new Error('Failed to fetch admin reports')
      }

      return response.json()
    },
  })
}