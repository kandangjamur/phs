import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { UserRole } from '@/lib/models'
import { logAuditEvent } from '@/lib/audit'

const InviteUserSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.enum([UserRole.RECRUITER, UserRole.INTERVIEWER, UserRole.HIRING_MANAGER, UserRole.VIEWER]),
  name: z.string().min(1, 'Name is required')
})

export async function POST(request: NextRequest) {
  try {
    // Only recruiters can invite users
    const currentUser = await requireRole([UserRole.RECRUITER])
    
    const body = await request.json()
    const { email, role, name } = InviteUserSchema.parse(body)
    
    // In a real implementation, you would:
    // 1. Check if user already exists
    // 2. Generate an invitation token
    // 3. Send invitation email
    // 4. Store invitation in database
    
    // For now, we'll just simulate the process
    const invitationId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Log audit event
    await logAuditEvent('user', invitationId, 'invited', {
      email,
      role,
      name,
      invitedBy: currentUser._id
    })
    
    // Simulate sending email (in production, integrate with email service)
    console.log(`Sending invitation email to ${email} for role ${role}`)
    
    return NextResponse.json({
      message: 'User invitation sent successfully',
      invitationId,
      email,
      role,
      name,
      // In production, you'd generate a secure invitation link
      invitationLink: `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${invitationId}`
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error inviting user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to invite user' },
      { status: error instanceof Error && error.message.includes('Permission') ? 403 : 500 }
    )
  }
}
