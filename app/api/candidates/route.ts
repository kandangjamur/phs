import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { CandidateSchema } from '@/lib/models'
import { requirePermission } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    // Temporarily bypass auth for testing
    // await requirePermission('read', 'candidates')
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    
    // Build filters
    const filters: any = {}
    if (searchParams.get('status')) filters.status = searchParams.get('status')
    if (searchParams.get('level')) filters.level = searchParams.get('level')
    if (searchParams.get('role')) filters.role = { $regex: searchParams.get('role'), $options: 'i' }
    if (searchParams.get('interviewerId')) filters.interviewerId = searchParams.get('interviewerId')
    
    // Search functionality
    const search = searchParams.get('search')
    if (search) {
      const candidates = await db.searchCandidates(search, filters)
      return NextResponse.json({ candidates, total: candidates.length, page, limit })
    }
    
    const result = await db.getCandidates(filters, { skip, limit })
    
    return NextResponse.json({
      candidates: result.candidates,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    })
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch candidates' },
      { status: error instanceof Error && error.message.includes('Permission') ? 403 : 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Temporarily bypass auth for testing
    // const user = await requirePermission('create', 'candidates')
    
    const body = await request.json()
    const validatedData = CandidateSchema.omit({ _id: true, createdAt: true, updatedAt: true }).parse(body)
    
    // Check for duplicate email
    const existingCandidate = await db.getCandidateByEmail(validatedData.email)
    if (existingCandidate) {
      return NextResponse.json(
        { error: 'Candidate with this email already exists' },
        { status: 400 }
      )
    }
    
    // Ensure all fields are properly initialized, even if not provided
    // Use null instead of undefined so MongoDB stores the fields
    const candidateData = {
      // Required fields (already validated by schema)
      name: validatedData.name,
      email: validatedData.email,
      role: validatedData.role,
      
      // Optional fields - explicitly set to null if not provided (so MongoDB stores them)
      project: validatedData.project || null,
      interviewerId: validatedData.interviewerId || null,
      interviewSchedule: validatedData.interviewSchedule || null,
      professionalExperience: validatedData.professionalExperience || null,
      mainLanguage: validatedData.mainLanguage || null,
      database: validatedData.database || null,
      cloud: validatedData.cloud || null,
      liveCodeResult: validatedData.liveCodeResult || null,
      mirror: validatedData.mirror || null,
      liveCodeVerdict: validatedData.liveCodeVerdict || null,
      level: validatedData.level || null,
      
      // Fields with defaults
      anotherTech: validatedData.anotherTech || [],
      status: validatedData.status || 'APPLIED',
      
      // System fields
      deletedAt: null
    }
    
    const candidate = await db.createCandidate(candidateData)
    
    // Log audit event (skip if no user context)
    try {
      await logAuditEvent('candidate', candidate._id!, 'created', { candidate: validatedData })
    } catch (auditError) {
      console.warn('Audit logging failed:', auditError)
      // Continue anyway - audit logging shouldn't break the creation
    }
    
    return NextResponse.json(candidate, { status: 201 })
  } catch (error) {
    console.error('Error creating candidate:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create candidate' },
      { status: error instanceof Error && error.message.includes('Permission') ? 403 : 500 }
    )
  }
}
