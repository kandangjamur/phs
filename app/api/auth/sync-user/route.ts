import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { UserRole } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user already exists
    const existingUser = await db.getUserByClerkId(user.id)
    if (existingUser) {
      return NextResponse.json(existingUser)
    }

    // Create new user with default role
    const newUser = await db.createUser({
      clerkId: user.id,
      name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
      email: user.emailAddresses[0]?.emailAddress || '',
      role: UserRole.HIRING_MANAGER // Default role with import permissions
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync user' },
      { status: 500 }
    )
  }
}
