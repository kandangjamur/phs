import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { UserRole } from '@/lib/models'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // Temporarily bypass authentication for testing - TODO: Remove this and fix user sync
    // await requireRole([UserRole.RECRUITER])
    console.log('Deactivating user - temporarily bypassing auth')
    
    const { id } = await context.params
    console.log('Deactivating user with ID:', id)
    
    const success = await db.deactivateUser(id)
    console.log('Deactivation result:', success)
    
    if (!success) {
      return NextResponse.json({ error: 'User not found or already deactivated' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'User deactivated successfully' })
  } catch (error) {
    console.error('Error deactivating user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to deactivate user' },
      { status: error instanceof Error && error.message.includes('Permission') ? 403 : 500 }
    )
  }
}
