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

    // Get current user from database
    const dbUser = await db.getUserByClerkId(user.id)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    // For demo purposes, allow any user to upgrade to HIRING_MANAGER
    // In production, this should be restricted to admin users only
    const updatedRole = UserRole.HIRING_MANAGER

    const success = await db.updateUser(dbUser._id!, { role: updatedRole })
    if (!success) {
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
    }

    const updatedUser = await db.getUserByClerkId(user.id)
    
    return NextResponse.json({ 
      message: 'Role upgraded successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error upgrading user role:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upgrade role' },
      { status: 500 }
    )
  }
}

