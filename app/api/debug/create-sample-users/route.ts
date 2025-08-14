import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserRole } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    // Create sample users for testing
    const sampleUsers = [
      {
        clerkId: 'user_sample_1',
        name: 'John Recruiter',
        email: 'john.recruiter@company.com',
        role: UserRole.RECRUITER
      },
      {
        clerkId: 'user_sample_2',
        name: 'Jane Hiring Manager',
        email: 'jane.manager@company.com',
        role: UserRole.HIRING_MANAGER
      },
      {
        clerkId: 'user_sample_3',
        name: 'Mike Interviewer',
        email: 'mike.interviewer@company.com',
        role: UserRole.INTERVIEWER
      },
      {
        clerkId: 'user_sample_4',
        name: 'Sarah Viewer',
        email: 'sarah.viewer@company.com',
        role: UserRole.VIEWER
      },
      {
        clerkId: 'user_sample_5',
        name: 'Alex Smith',
        email: 'alex.smith@company.com',
        role: UserRole.HIRING_MANAGER
      }
    ]

    const createdUsers = []
    for (const userData of sampleUsers) {
      try {
        // Check if user already exists
        const existingUser = await db.getUserByClerkId(userData.clerkId)
        if (!existingUser) {
          const newUser = await db.createUser(userData)
          createdUsers.push(newUser)
        } else {
          console.log(`User ${userData.email} already exists`)
        }
      } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error)
      }
    }

    return NextResponse.json({
      message: 'Sample users created successfully',
      created: createdUsers.length,
      users: createdUsers
    })
  } catch (error) {
    console.error('Error creating sample users:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create sample users' },
      { status: 500 }
    )
  }
}
