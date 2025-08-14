import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Bypass authentication for debugging
    const result = await db.getAllUsers({
      page: 1,
      limit: 50
    })
    
    return NextResponse.json({
      message: 'Debug: All users in MongoDB',
      ...result
    })
  } catch (error) {
    console.error('Error fetching users for debug:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
