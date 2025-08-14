"use client"

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && user) {
        try {
          // Sync user with our MongoDB database
          const response = await fetch('/api/auth/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (response.ok) {
            console.log('User synced successfully')
          } else {
            console.warn('Failed to sync user:', await response.text())
          }
        } catch (error) {
          console.error('Error syncing user:', error)
        }
      }
    }

    syncUser()
  }, [user, isLoaded])

  return <>{children}</>
}
