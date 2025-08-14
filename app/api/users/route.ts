import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserSchema, UserRole } from '@/lib/models'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    await requireRole([UserRole.RECRUITER, UserRole.HIRING_MANAGER])
    
    // For now, return a simple list of users
    // In a real implementation, you'd fetch all users from the database
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Mock user data for now - in production, implement proper user management
    const users = [
      {
        _id: '1',
        clerkId: 'user_1',
        name: 'John Recruiter',
        email: 'john@company.com',
        role: UserRole.RECRUITER,
        createdAt: new Date()
      },
      {
        _id: '2', 
        clerkId: 'user_2',
        name: 'Jane Interviewer',
        email: 'jane@company.com',
        role: UserRole.INTERVIEWER,
        createdAt: new Date()
      }
    ]
    
    return NextResponse.json({
      users,
      total: users.length,
      page,
      limit,
      totalPages: Math.ceil(users.length / limit)
    })
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

