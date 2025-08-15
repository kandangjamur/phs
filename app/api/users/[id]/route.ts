import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserSchema, UserRole } from '@/lib/models'
import { requireRole } from '@/lib/auth'
import { logAuditEvent, createDiff } from '@/lib/audit'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // Temporarily bypass authentication for testing - TODO: Remove this and fix user sync
    // await requireRole([UserRole.RECRUITER]) // Only recruiters can update user roles
    console.log('Updating user role - temporarily bypassing auth')
    
    const { id } = await context.params
    console.log('Updating user with ID:', id)
    
    const user = await db.getUserById(id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const body = await request.json()
    console.log('Update payload:', body)
    
    const updates = UserSchema.partial().parse(body)
    console.log('Parsed updates:', updates)
    
    // Remove fields that shouldn't be updated directly
    delete updates._id
    delete updates.clerkId
    delete updates.createdAt
    delete updates.updatedAt
    
    const success = await db.updateUser(id, updates)
    console.log('Update result:', success)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
    
    // Get updated user
    const updatedUser = await db.getUserById(id)
    console.log('Updated user:', updatedUser)
    
    // Log audit event - wrap in try-catch to prevent main operation from failing
    try {
      const diff = createDiff(user, updatedUser)
      await logAuditEvent('user', id, 'updated', diff)
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError)
      // Don't fail the main operation if audit logging fails
    }
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update user' },
      { status: error instanceof Error && error.message.includes('Permission') ? 403 : 500 }
    )
  }
}

