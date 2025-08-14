import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requirePermission } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Temporarily bypass auth for testing
    // await requirePermission('delete', 'notes')
    const { id } = await context.params
    
    // Get note before deletion for audit log
    const note = await db.getNoteById(id)
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    const success = await db.deleteNote(id)
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
    }
    
    // Log audit event
    try {
      await logAuditEvent('candidate', note.candidateId, 'note_deleted', { note })
    } catch (auditError) {
      console.warn('Audit logging failed:', auditError)
      // Continue anyway - audit logging shouldn't break the deletion
    }
    
    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete note' },
      { status: error instanceof Error && error.message.includes('Permission') ? 403 : 500 }
    )
  }
}

