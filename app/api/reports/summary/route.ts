import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requirePermission } from '@/lib/auth'
import { CandidateStatus } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await requirePermission('read', 'reports')
    
    const summary = await db.getReportSummary()
    
    // Calculate additional metrics
    const totalCandidates = summary.total
    const statusCounts = summary.statusCounts
    
    // Calculate pass-through rates
    const appliedCount = statusCounts[CandidateStatus.APPLIED] || 0
    const screeningCount = statusCounts[CandidateStatus.SCREENING] || 0
    const interviewCount = statusCounts[CandidateStatus.INTERVIEW] || 0
    const passedCount = statusCounts[CandidateStatus.PASSED] || 0
    const offerCount = statusCounts[CandidateStatus.OFFER] || 0
    const rejectedCount = statusCounts[CandidateStatus.REJECTED] || 0
    
    const progressedBeyondApplied = totalCandidates - appliedCount
    const progressedToInterview = interviewCount + passedCount + offerCount
    const finalPassRate = totalCandidates > 0 ? ((passedCount + offerCount) / totalCandidates * 100) : 0
    
    // Time-based analysis would require more complex aggregation
    // For now, providing basic metrics
    
    const metrics = {
      totalCandidates,
      statusBreakdown: {
        applied: appliedCount,
        screening: screeningCount,
        interview: interviewCount,
        passed: passedCount,
        offer: offerCount,
        rejected: rejectedCount
      },
      conversionRates: {
        applicationToScreening: appliedCount > 0 ? (progressedBeyondApplied / totalCandidates * 100) : 0,
        screeningToInterview: screeningCount > 0 ? (progressedToInterview / (screeningCount + progressedToInterview) * 100) : 0,
        interviewToPass: interviewCount > 0 ? (passedCount / (interviewCount + passedCount + rejectedCount) * 100) : 0,
        overallPassRate: finalPassRate
      },
      pipeline: {
        inProgress: appliedCount + screeningCount + interviewCount,
        completed: passedCount + offerCount + rejectedCount,
        pending: appliedCount + screeningCount
      }
    }
    
    return NextResponse.json(metrics)
    
  } catch (error) {
    console.error('Error fetching report summary:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch reports' },
      { status: error instanceof Error && error.message.includes('Permission') ? 403 : 500 }
    )
  }
}

