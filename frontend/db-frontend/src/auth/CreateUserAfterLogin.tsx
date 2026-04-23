import { useEffect, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useCreateMyUser } from '@/api/MyUserApi'

export default function CreateUserAfterLogin() {
  const { user, isAuthenticated, isLoading } = useAuth0()
  const { createUser } = useCreateMyUser()
  const hasCreated = useRef(false)

  useEffect(() => {
    if (isAuthenticated && !isLoading && user?.sub && user?.email && !hasCreated.current) {
      hasCreated.current = true
      createUser({ auth0_id: user.sub, email: user.email })
    }
  }, [isAuthenticated, isLoading, user])

  return null
}