import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requirePermission } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requirePermission('export', 'candidates')
    
    const searchParams = request.nextUrl.searchParams
    
    // Build filters for export
    const filters: any = {}
    if (searchParams.get('status')) filters.status = searchParams.get('status')
    if (searchParams.get('level')) filters.level = searchParams.get('level')
    if (searchParams.get('role')) filters.role = { $regex: searchParams.get('role'), $options: 'i' }
    if (searchParams.get('interviewerId')) filters.interviewerId = searchParams.get('interviewerId')
    
    // Get all candidates matching filters (no pagination for export)
    const result = await db.getCandidates(filters, { limit: 10000 })
    
    // CSV Headers
    const headers = [
      'name',
      'email', 
      'role',
      'project',
      'interviewer',
      'interview_schedule',
      'professional_experience',
      'main_language',
      'database',
      'cloud',
      'another_tech',
      'live_code_result',
      'status',
      'level',
      'mirror',
      'created_at'
    ]
    
    // Convert candidates to CSV rows
    const csvRows = result.candidates.map(candidate => {
      return [
        candidate.name,
        candidate.email,
        candidate.role,
        candidate.project || '',
        candidate.interviewerId || '',
        candidate.interviewSchedule || '',
        candidate.professionalExperience || '',
        candidate.mainLanguage || '',
        candidate.database || '',
        candidate.cloud || '',
        (candidate.anotherTech || []).join(';'),
        candidate.liveCodeResult || '',
        candidate.status,
        candidate.level || '',
        candidate.mirror || '',
        candidate.createdAt?.toISOString() || ''
      ].map(field => `"${field.toString().replace(/"/g, '""')}"`) // Escape quotes
    })
    
    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')
    
    // Return CSV file
    const fileName = `candidates_export_${new Date().toISOString().split('T')[0]}.csv`
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })
    
  } catch (error) {
    console.error('Error exporting candidates:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export candidates' },
      { status: error instanceof Error && error.message.includes('Permission') ? 403 : 500 }
    )
  }
}

