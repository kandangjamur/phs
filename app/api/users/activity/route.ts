import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { UserRole } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await requireRole([UserRole.RECRUITER, UserRole.HIRING_MANAGER])
    
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      )
    }
    
    // Get user activity from audit logs
    const auditLogs = await db.getAuditLogs(userId, 'user')
    
    // Also get activity where this user was the actor
    const userActions = await db.getAuditLogsByActor(userId)
    
    // Combine and sort by date
    const allActivity = [...auditLogs, ...userActions]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
    
    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedActivity = allActivity.slice(startIndex, endIndex)
    
    return NextResponse.json({
      activity: paginatedActivity,
      total: allActivity.length,
      page,
      limit,
      totalPages: Math.ceil(allActivity.length / limit)
    })
  } catch (error) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user activity' },
      { status: error instanceof Error && error.message.includes('Permission') ? 403 : 500 }
    )
  }
}
