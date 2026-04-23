import { useAuth0 } from '@auth0/auth0-react'

export const useIsAdmin = () => {
  const { user } = useAuth0()
  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',') ?? []
  return adminEmails.includes(user?.email ?? '')
}