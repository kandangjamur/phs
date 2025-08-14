import { auth } from '@clerk/nextjs/server'
import { UserRole } from './models'
import { db } from './db'

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null
  
  const user = await db.getUserByClerkId(userId)
  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }
  return user
}

export function hasPermission(userRole: string, action: string, resource?: string): boolean {
  const permissions = {
    [UserRole.RECRUITER]: {
      candidates: ['read', 'create', 'update', 'delete', 'import', 'export'],
      interviews: ['read', 'create', 'update', 'delete'],
      notes: ['read', 'create', 'update', 'delete'],
      reports: ['read'],
      users: ['read', 'update']
    },
    [UserRole.HIRING_MANAGER]: {
      candidates: ['read', 'create', 'update', 'import', 'export'], // Added import/export
      interviews: ['read', 'create', 'update'],
      notes: ['read', 'create', 'update'],
      reports: ['read']
    },
    [UserRole.INTERVIEWER]: {
      candidates: ['read', 'create', 'update'], // Added create
      interviews: ['read', 'update'],
      notes: ['read', 'create', 'update'],
      reports: ['read']
    },
    [UserRole.VIEWER]: {
      candidates: ['read'],
      interviews: ['read'],
      notes: ['read'],
      reports: ['read']
    }
  }

  const userPermissions = permissions[userRole as keyof typeof permissions]
  if (!userPermissions || !resource) return false
  
  const resourcePermissions = userPermissions[resource as keyof typeof userPermissions]
  return Array.isArray(resourcePermissions) && resourcePermissions.includes(action)
}

export async function requirePermission(action: string, resource: string) {
  const user = await requireAuth()
  if (!hasPermission(user.role, action, resource)) {
    throw new Error(`Permission denied: ${action} on ${resource}`)
  }
  return user
}
