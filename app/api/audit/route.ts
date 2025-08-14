import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requirePermission } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Temporarily bypass auth for testing
    // await requirePermission('read', 'reports')
    
    const searchParams = request.nextUrl.searchParams
    const entityId = searchParams.get('entityId')
    const entityType = searchParams.get('entityType')
    
    if (!entityId || !entityType) {
      return NextResponse.json(
        { error: 'entityId and entityType are required' },
        { status: 400 }
      )
    }
    
    const auditLogs = await db.getAuditLogs(entityId, entityType)
    
    return NextResponse.json(auditLogs)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch audit logs' },
      { status: error instanceof Error && error.message.includes('Permission') ? 403 : 500 }
    )
  }
}

