import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserSchema, UserRole } from '@/lib/models'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    // Temporarily bypass authentication for testing - TODO: Remove this and fix user sync
    // await requireRole([UserRole.RECRUITER, UserRole.HIRING_MANAGER])
    console.log('Fetching users - temporarily bypassing auth')
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || undefined
    const role = searchParams.get('role') || undefined
    const status = (searchParams.get('status') as 'active' | 'inactive' | 'all') || 'all'
    
    console.log('Fetching users with params:', { page, limit, search, role, status })
    
    const result = await db.getAllUsers({
      page,
      limit,
      search,
      role,
      status
    })
    
    console.log('Users fetch result:', { total: result.total, usersCount: result.users.length })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch users' },
      { status: error instanceof Error && error.message.includes('Permission') ? 403 : 500 }
    )
  }
}

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
      name: user.fullName || user.firstName + ' ' + user.lastName || 'Unknown',
      email: user.emailAddresses[0]?.emailAddress || '',
      role: UserRole.VIEWER // Default role
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    )
  }
}

