import { db } from './db'
import { getCurrentUser } from './auth'

export async function logAuditEvent(
  entityType: string,
  entityId: string,
  action: string,
  diff?: Record<string, any>
) {
  try {
    const user = await getCurrentUser()
    if (!user) return // Silent fail if no user (system operations)
    
    await db.createAuditLog({
      entityType,
      entityId,
      action,
      diff,
      actorId: user._id!,
      actorName: user.name
    })
  } catch (error) {
    console.error('Failed to log audit event:', error)
    // Don't throw - audit logging shouldn't break the main operation
  }
}

export function createDiff(before: any, after: any): Record<string, any> {
  const diff: Record<string, any> = {}
  
  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})])
  
  for (const key of allKeys) {
    const beforeValue = before?.[key]
    const afterValue = after?.[key]
    
    if (beforeValue !== afterValue) {
      diff[key] = {
        before: beforeValue,
        after: afterValue
      }
    }
  }
  
  return diff
}

