import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    return NextResponse.json({
      message: 'Debug: Current Clerk user',
      user: user ? {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName
      } : null
    })
  } catch (error) {
    console.error('Error fetching Clerk user for debug:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Clerk user' },
      { status: 500 }
    )
  }
}
