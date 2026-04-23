import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import {
  useAdminStats,
  useAdminUsers,
  useAdminStations,
  useAdminSearchHistory,
  useDeleteUser,
  useDeleteStation,
  useAdminReports,
} from '../api/AdminAPI.tsx'
import { useQueryClient } from '@tanstack/react-query'

type Tab = 'overview' | 'users' | 'stations' | 'searches' | 'reports'

type ConfirmDeleteState = {
  type: 'user' | 'station'
  id: string
} | null

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: string
}) {
  return (
    <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl px-6 py-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-[#1a1d2e] flex items-center justify-center text-xl">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-[#6b7280] text-xs mt-1">{label}</p>
      </div>
    </div>
  )
}

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f1117] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full mx-4 text-center">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="text-white font-semibold mb-1">Are you sure?</p>
        <p className="text-[#6b7280] text-sm mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-[#1a1d27] border border-[#2a2d3a] text-[#9ca3af] text-sm py-2.5 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2.5 rounded-lg font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDate(value?: string | null) {
  if (!value) return '—'

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

function LoadingBlock({ text }: { text: string }) {
  return (
    <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl p-6">
      <p className="text-[#9ca3af] text-sm">{text}</p>
    </div>
  )
}

function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-[#6b7280]">
        {text}
      </td>
    </tr>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isLoading: authLoading, isAuthenticated } = useAuth0()
  const {
  data: reports,
  isLoading: reportsLoading,
  error: reportsError,
} = useAdminReports()

  const [tab, setTab] = useState<Tab>('overview')
  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [stationSearch, setStationSearch] = useState('')
  const [stationStatus, setStationStatus] = useState('')
  const [stationPage, setStationPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>(null)

  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-search-history'] })
    }
  }, [isAuthenticated, user?.sub, queryClient])

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useAdminStats()

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useAdminUsers(userSearch, userPage)

  const {
    data: stationsData,
    isLoading: stationsLoading,
    error: stationsError,
  } = useAdminStations(stationSearch, stationStatus, stationPage)

  const {
    data: searchData,
    isLoading: searchesLoading,
    error: searchesError,
  } = useAdminSearchHistory(searchPage)

  const { mutate: deleteUser, isPending: deletingUser } = useDeleteUser()
  const { mutate: deleteStation, isPending: deletingStation } = useDeleteStation()

  const users = useMemo(() => {
    if (Array.isArray(usersData)) return usersData
    return usersData?.users ?? []
  }, [usersData])

  const usersTotal = useMemo(() => {
    if (Array.isArray(usersData)) return usersData.length
    return usersData?.total ?? 0
  }, [usersData])

  const usersPages = useMemo(() => {
    if (Array.isArray(usersData)) return 1
    return usersData?.pages ?? 1
  }, [usersData])

  const stations = stationsData?.stations ?? []
  const stationsTotal = stationsData?.total ?? 0
  const stationsPages = stationsData?.pages ?? 1

  const history = searchData?.history ?? []
  const topStations = searchData?.topStations ?? []
  const searchTotal = searchData?.total ?? 0
  const searchPages = searchData?.pages ?? 1

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'stations', label: 'Stations', icon: '⛽' },
    { id: 'searches', label: 'Search History', icon: '🔍' },
    { id: 'reports', label: 'Reports', icon: '📈' },
  ]

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070810] flex items-center justify-center text-white">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070810] flex items-center justify-center text-white">
        Access denied
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070810] text-white flex">
      <aside className="w-56 bg-[#0a0c14] border-r border-[#1e2130] flex flex-col fixed h-full">
        <div className="px-5 py-6 border-b border-[#1e2130]">
          <div className="w-9 h-9 bg-[#f59e0b] rounded-lg flex items-center justify-center text-xs font-bold mb-3">
            ⛽
          </div>
          <p className="text-white font-bold text-sm">Admin Panel</p>
          <p className="text-[#4b5563] text-xs mt-0.5">{user?.email ?? 'No email'}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                tab === t.id
                  ? 'bg-[#f59e0b]/20 text-[#f59e0b] font-medium'
                  : 'text-[#6b7280] hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-[#1e2130]">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#6b7280] hover:text-white hover:bg-white/5 transition-colors"
          >
            <span>🏠</span>
            Back to App
          </button>
        </div>
      </aside>

      <main className="ml-56 flex-1 p-8">
        {tab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
              <p className="text-[#6b7280] text-sm mt-1">
                Lesotho Petrol Finder — Admin Panel
              </p>
            </div>

            {statsLoading ? (
              <LoadingBlock text="Loading dashboard stats..." />
            ) : statsError ? (
              <LoadingBlock text="Failed to load dashboard stats." />
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Total Users"
                    value={stats?.totalUsers ?? 0}
                    icon="👥"
                  />
                  <StatCard
                    label="Stations Tracked"
                    value={stats?.totalStations ?? 0}
                    icon="⛽"
                  />
                  <StatCard
                    label="Stations with Fuel"
                    value={stats?.availableStations ?? 0}
                    icon="🟢"
                  />
                  <StatCard
                    label="Stations without Fuel"
                    value={stats?.unavailableStations ?? 0}
                    icon="🔴"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl p-6">
                    <h2 className="text-white font-semibold mb-4">🔍 Recent Searches</h2>
                    <div className="space-y-3">
                      {stats?.recentSearches?.length ? (
                        stats.recentSearches.map((s: any, i: number) => (
                          <div key={i} className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm font-medium">
                                {s.station_name ?? 'Unknown station'}
                              </p>
                              <p className="text-[#6b7280] text-xs">{s.email ?? '—'}</p>
                            </div>
                            <span className="text-[#4b5563] text-xs">
                              {formatDate(s.searched_at)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[#6b7280] text-sm">No recent searches found.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl p-6">
                    <h2 className="text-white font-semibold mb-4">👥 Recent Registrations</h2>
                    <div className="space-y-3">
                      {stats?.recentUsers?.length ? (
                        stats.recentUsers.map((u: any, i: number) => (
                          <div key={i} className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm font-medium">
                                {u.username ?? '—'}
                              </p>
                              <p className="text-[#6b7280] text-xs">{u.email ?? '—'}</p>
                            </div>
                            <span className="text-[#4b5563] text-xs">
                              {formatDate(u.created_at)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[#6b7280] text-sm">
                          No recent registrations found.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Users</h1>
              <p className="text-[#6b7280] text-sm mt-1">{usersTotal} registered</p>
            </div>

            <input
              type="text"
              placeholder="Search by email or username..."
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value)
                setUserPage(1)
              }}
              className="bg-[#0f1117] border border-[#1e2130] text-white text-sm rounded-lg px-4 py-2.5 w-72 focus:outline-none focus:border-[#f59e0b] placeholder-[#4b5563]"
            />

            <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e2130]">
                    {['Email', 'Username', 'Registered', 'Actions'].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[#6b7280]"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <EmptyRow colSpan={4} text="Loading users..." />
                  ) : usersError ? (
                    <EmptyRow colSpan={4} text="Failed to load users." />
                  ) : users.length === 0 ? (
                    <EmptyRow colSpan={4} text="No users found." />
                  ) : (
                    users.map((u: any, i: number) => (
                      <tr
                        key={u.auth0_id ?? u.id ?? i}
                        className={`border-b border-[#1e2130] ${
                          i % 2 === 0 ? 'bg-[#0a0c14]/50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-white">{u.email ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-[#9ca3af]">
                          {u.username ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#9ca3af]">
                          {formatDate(u.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                type: 'user',
                                id: u.auth0_id,
                              })
                            }
                            className="px-2.5 py-1 bg-[#1a1d27] hover:bg-red-500/20 border border-[#2a2d3a] hover:border-red-500/30 text-[#9ca3af] hover:text-red-400 text-xs rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {usersPages > 1 && (
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                  disabled={userPage === 1}
                  className="px-4 py-2 bg-[#0f1117] border border-[#1e2130] text-sm text-[#9ca3af] rounded-lg disabled:opacity-40 hover:text-white"
                >
                  ← Prev
                </button>
                <span className="text-[#6b7280] text-sm">
                  Page {userPage} of {usersPages}
                </span>
                <button
                  onClick={() => setUserPage((p) => Math.min(usersPages, p + 1))}
                  disabled={userPage === usersPages}
                  className="px-4 py-2 bg-[#0f1117] border border-[#1e2130] text-sm text-[#9ca3af] rounded-lg disabled:opacity-40 hover:text-white"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'stations' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Stations</h1>
              <p className="text-[#6b7280] text-sm mt-1">{stationsTotal} tracked</p>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search by name..."
                value={stationSearch}
                onChange={(e) => {
                  setStationSearch(e.target.value)
                  setStationPage(1)
                }}
                className="bg-[#0f1117] border border-[#1e2130] text-white text-sm rounded-lg px-4 py-2.5 w-72 focus:outline-none focus:border-[#f59e0b] placeholder-[#4b5563]"
              />

              <select
                value={stationStatus}
                onChange={(e) => {
                  setStationStatus(e.target.value)
                  setStationPage(1)
                }}
                className="bg-[#0f1117] border border-[#1e2130] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f59e0b]"
              >
                <option value="">All Statuses</option>
                <option value="available">🟢 Has Fuel</option>
                <option value="unavailable">🔴 No Fuel</option>
                <option value="unknown">⚪ Unknown</option>
              </select>
            </div>

            <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e2130]">
                    {[
                      'Station',
                      'Petrol',
                      'Diesel',
                      'Paraffin',
                      'Updated By',
                      'Last Updated',
                      'Actions',
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[#6b7280]"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stationsLoading ? (
                    <EmptyRow colSpan={7} text="Loading stations..." />
                  ) : stationsError ? (
                    <EmptyRow colSpan={7} text="Failed to load stations." />
                  ) : stations.length === 0 ? (
                    <EmptyRow colSpan={7} text="No stations found." />
                  ) : (
                    stations.map((s: any, i: number) => (
                      <tr
                        key={s.place_id ?? i}
                        className={`border-b border-[#1e2130] ${
                          i % 2 === 0 ? 'bg-[#0a0c14]/50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-white font-medium">
                          {s.name ?? 'Unnamed station'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {s.has_petrol === null ? '⚪' : s.has_petrol ? '🟢' : '🔴'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {s.has_diesel === null ? '⚪' : s.has_diesel ? '🟢' : '🔴'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {s.has_paraffin === null ? '⚪' : s.has_paraffin ? '🟢' : '🔴'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#9ca3af] truncate max-w-[140px]">
                          {s.updated_by_email ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#9ca3af]">
                          {formatDate(s.updated_at)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                type: 'station',
                                id: s.place_id,
                              })
                            }
                            className="px-2.5 py-1 bg-[#1a1d27] hover:bg-red-500/20 border border-[#2a2d3a] hover:border-red-500/30 text-[#9ca3af] hover:text-red-400 text-xs rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {stationsPages > 1 && (
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => setStationPage((p) => Math.max(1, p - 1))}
                  disabled={stationPage === 1}
                  className="px-4 py-2 bg-[#0f1117] border border-[#1e2130] text-sm text-[#9ca3af] rounded-lg disabled:opacity-40 hover:text-white"
                >
                  ← Prev
                </button>
                <span className="text-[#6b7280] text-sm">
                  Page {stationPage} of {stationsPages}
                </span>
                <button
                  onClick={() => setStationPage((p) => Math.min(stationsPages, p + 1))}
                  disabled={stationPage === stationsPages}
                  className="px-4 py-2 bg-[#0f1117] border border-[#1e2130] text-sm text-[#9ca3af] rounded-lg disabled:opacity-40 hover:text-white"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
        {tab === 'reports' && (
  <div className="space-y-8">
    <div>
      <h1 className="text-2xl font-bold text-white">Reports</h1>
      <p className="text-[#6b7280] text-sm mt-1">
        Fuel availability and user activity reports
      </p>
    </div>

    {reportsLoading ? (
      <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl p-6">
        <p className="text-[#9ca3af] text-sm">Loading reports...</p>
      </div>
    ) : reportsError ? (
      <div className="bg-[#0f1117] border border-red-500/30 rounded-2xl p-6">
        <p className="text-red-400 text-sm">Failed to load reports.</p>
      </div>
    ) : (
      <>
        <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl p-6 overflow-x-auto">
          <h2 className="text-white font-semibold mb-4">
            Monthly Petrol Availability
          </h2>

          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2130]">
                {['Month', 'Station', 'Available', 'Unavailable', 'Availability %'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[#6b7280]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports?.monthlyAvailability?.length ? (
                reports.monthlyAvailability.map((row: any, index: number) => (
                  <tr key={index} className="border-b border-[#1e2130]">
                    <td className="px-4 py-3 text-sm text-[#9ca3af]">{row.month}</td>
                    <td className="px-4 py-3 text-sm text-white">{row.station_name}</td>
                    <td className="px-4 py-3 text-sm text-green-400">{row.available_reports}</td>
                    <td className="px-4 py-3 text-sm text-red-400">{row.unavailable_reports}</td>
                    <td className="px-4 py-3 text-sm text-yellow-400">
                      {row.availability_percentage ?? 0}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-[#6b7280]">
                    No monthly availability data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl p-6 overflow-x-auto">
          <h2 className="text-white font-semibold mb-4">
            Most Active Users Updating Fuel Status
          </h2>

          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2130]">
                {['User Email', 'Updates', 'Last Update'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[#6b7280]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports?.mostActiveUsers?.length ? (
                reports.mostActiveUsers.map((row: any) => (
                  <tr key={row.updated_by_auth0_id} className="border-b border-[#1e2130]">
                    <td className="px-4 py-3 text-sm text-white">{row.updated_by_email}</td>
                    <td className="px-4 py-3 text-sm text-yellow-400">{row.update_count}</td>
                    <td className="px-4 py-3 text-sm text-[#9ca3af]">
                      {row.last_update ? new Date(row.last_update).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm text-[#6b7280]">
                    No user update activity yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl p-6 overflow-x-auto">
          <h2 className="text-white font-semibold mb-4">
            Stations Frequently Reported Out of Fuel
          </h2>

          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2130]">
                {['Station', 'Out-of-Fuel Reports', 'Last Reported'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[#6b7280]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports?.mostUnavailableStations?.length ? (
                reports.mostUnavailableStations.map((row: any) => (
                  <tr key={row.place_id} className="border-b border-[#1e2130]">
                    <td className="px-4 py-3 text-sm text-white">{row.station_name}</td>
                    <td className="px-4 py-3 text-sm text-red-400">{row.unavailable_reports}</td>
                    <td className="px-4 py-3 text-sm text-[#9ca3af]">
                      {row.last_reported_unavailable
                        ? new Date(row.last_reported_unavailable).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm text-[#6b7280]">
                    No out-of-fuel reports yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl p-6 overflow-x-auto">
          <h2 className="text-white font-semibold mb-4">
            Recent Fuel Status Updates
          </h2>

          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2130]">
                {['Station', 'Status', 'Updated By', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[#6b7280]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports?.recentStatusUpdates?.length ? (
                reports.recentStatusUpdates.map((row: any, index: number) => (
                  <tr key={index} className="border-b border-[#1e2130]">
                    <td className="px-4 py-3 text-sm text-white">{row.station_name}</td>
                    <td className="px-4 py-3 text-sm">
                      {row.has_fuel ? (
                        <span className="text-green-400">Has Fuel</span>
                      ) : (
                        <span className="text-red-400">No Fuel</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9ca3af]">
                      {row.updated_by_email ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9ca3af]">
                      {row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-[#6b7280]">
                    No recent status updates yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    )}
  </div>
)}

        {tab === 'searches' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Search History</h1>
              <p className="text-[#6b7280] text-sm mt-1">{searchTotal} searches recorded</p>
            </div>

            <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">🏆 Most Searched Stations</h2>

              {searchesLoading ? (
                <p className="text-[#9ca3af] text-sm">Loading search history...</p>
              ) : searchesError ? (
                <p className="text-[#9ca3af] text-sm">Failed to load search history.</p>
              ) : topStations.length === 0 ? (
                <p className="text-[#6b7280] text-sm">No search statistics found.</p>
              ) : (
                <div className="space-y-3">
                  {topStations.map((s: any) => (
                    <div key={s.place_id} className="flex items-center gap-3">
                      <span className="text-[#9ca3af] text-sm flex-1">
                        {s.station_name ?? 'Unknown station'}
                      </span>
                      <div className="w-32 bg-[#1a1d27] rounded-full h-2">
                        <div
                          className="bg-[#f59e0b] h-2 rounded-full"
                          style={{
                            width: `${
                              Math.min(
                                100,
                                (s.search_count / (topStations[0]?.search_count ?? 1)) * 100
                              )
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-white text-sm font-medium w-8 text-right">
                        {s.search_count ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#0f1117] border border-[#1e2130] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e2130]">
                    {['User Email', 'Station', 'Searched At'].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[#6b7280]"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {searchesLoading ? (
                    <EmptyRow colSpan={3} text="Loading search history..." />
                  ) : searchesError ? (
                    <EmptyRow colSpan={3} text="Failed to load search history." />
                  ) : history.length === 0 ? (
                    <EmptyRow colSpan={3} text="No search history found." />
                  ) : (
                    history.map((item: any) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#1e2130] hover:bg-[#0a0c14]/50"
                      >
                        <td className="px-4 py-3 text-sm text-[#9ca3af]">
                          {item.email ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          {item.station_name ?? 'Unknown station'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#9ca3af]">
                          {formatDateTime(item.searched_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {searchPages > 1 && (
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => setSearchPage((p) => Math.max(1, p - 1))}
                  disabled={searchPage === 1}
                  className="px-4 py-2 bg-[#0f1117] border border-[#1e2130] text-sm text-[#9ca3af] rounded-lg disabled:opacity-40 hover:text-white"
                >
                  ← Prev
                </button>
                <span className="text-[#6b7280] text-sm">
                  Page {searchPage} of {searchPages}
                </span>
                <button
                  onClick={() => setSearchPage((p) => Math.min(searchPages, p + 1))}
                  disabled={searchPage === searchPages}
                  className="px-4 py-2 bg-[#0f1117] border border-[#1e2130] text-sm text-[#9ca3af] rounded-lg disabled:opacity-40 hover:text-white"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {confirmDelete && (
        <ConfirmModal
          message="This action cannot be undone."
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            if (confirmDelete.type === 'user') {
              deleteUser(confirmDelete.id, {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['admin-users'] })
                  queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
                },
              })
            } else {
              deleteStation(confirmDelete.id, {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['admin-stations'] })
                  queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
                },
              })
            }

            setConfirmDelete(null)
          }}
        />
      )}

      {(deletingUser || deletingStation) && (
        <div className="fixed bottom-4 right-4 bg-[#0f1117] border border-[#1e2130] rounded-xl px-4 py-3 text-sm text-white shadow-lg">
          Processing delete...
        </div>
      )}
    </div>
  )
}