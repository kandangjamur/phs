import { getDatabase } from './mongodb'
import { User, Candidate, Note, Audit, UserSchema, CandidateSchema, NoteSchema, AuditSchema } from './models'
import { ObjectId } from 'mongodb'

export class DatabaseService {
  private async getDb() {
    return await getDatabase()
  }

  // User operations
  async createUser(user: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) {
    const db = await this.getDb()
    const now = new Date()
    const newUser = {
      ...user,
      createdAt: now,
      updatedAt: now
    }
    
    const result = await db.collection('users').insertOne(newUser)
    return { ...newUser, _id: result.insertedId.toString() }
  }

  async getUserByClerkId(clerkId: string): Promise<User | null> {
    const db = await this.getDb()
    const user = await db.collection('users').findOne({ clerkId })
    if (!user) return null
    
    return UserSchema.parse({ ...user, _id: user._id.toString() })
  }

  async getUserById(id: string): Promise<User | null> {
    const db = await this.getDb()
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) })
    if (!user) return null
    
    return UserSchema.parse({ ...user, _id: user._id.toString() })
  }

  async updateUser(id: string, updates: Partial<User>) {
    const db = await this.getDb()
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    )
    return result.modifiedCount > 0
  }

  async getAllUsers(options: { 
    page?: number, 
    limit?: number, 
    search?: string,
    role?: string,
    status?: 'active' | 'inactive' | 'all'
  } = {}) {
    const db = await this.getDb()
    const { page = 1, limit = 20, search, role, status = 'all' } = options
    
    // Build query
    const query: any = {}
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (role && role !== 'all') {
      query.role = role
    }
    
    if (status !== 'all') {
      if (status === 'active') {
        query.deactivatedAt = { $exists: false }
      } else {
        query.deactivatedAt = { $exists: true }
      }
    }
    
    const skip = (page - 1) * limit
    const users = await db.collection('users')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
    
    const total = await db.collection('users').countDocuments(query)
    
    return {
      users: users.map(user => UserSchema.parse({ ...user, _id: user._id.toString() })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async updateUserRole(id: string, newRole: string) {
    const db = await this.getDb()
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          role: newRole, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async deactivateUser(id: string) {
    const db = await this.getDb()
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          deactivatedAt: new Date(),
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  async reactivateUser(id: string) {
    const db = await this.getDb()
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { 
        $unset: { deactivatedAt: 1 },
        $set: { updatedAt: new Date() }
      }
    )
    return result.modifiedCount > 0
  }

  async getUserStats() {
    const db = await this.getDb()
    
    const totalUsers = await db.collection('users').countDocuments()
    const activeUsers = await db.collection('users').countDocuments({ 
      deactivatedAt: { $exists: false } 
    })
    const roleDistribution = await db.collection('users').aggregate([
      { $match: { deactivatedAt: { $exists: false } } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]).toArray()
    
    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      roleDistribution
    }
  }

  // Candidate operations
  async createCandidate(candidate: Omit<Candidate, '_id' | 'createdAt' | 'updatedAt'>) {
    const db = await this.getDb()
    const now = new Date()
    const newCandidate = {
      ...candidate,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    }
    
    const result = await db.collection('candidates').insertOne(newCandidate)
    return { ...newCandidate, _id: result.insertedId.toString() }
  }

  async getCandidates(filters: any = {}, pagination: { skip?: number, limit?: number } = {}) {
    const db = await this.getDb()
    const query = { deletedAt: null, ...filters }
    
    const candidates = await db.collection('candidates')
      .find(query)
      .skip(pagination.skip || 0)
      .limit(pagination.limit || 50)
      .sort({ createdAt: -1 })
      .toArray()

    const total = await db.collection('candidates').countDocuments(query)
    
    // Helper function to clean and parse candidate data
    const cleanCandidateData = (rawCandidate: any): any => {
      const cleaned = { ...rawCandidate, _id: rawCandidate._id.toString() }
      
      // Clean optional enum fields - convert invalid values to undefined
      if ((cleaned as any).level === "" || (cleaned as any).level === null || 
          !['Junior', 'Mid', 'Senior'].includes((cleaned as any).level)) {
        (cleaned as any).level = undefined
      }
      
      if ((cleaned as any).liveCodeVerdict === "" || (cleaned as any).liveCodeVerdict === null ||
          !['PASS', 'FAIL', 'ON_HOLD'].includes((cleaned as any).liveCodeVerdict)) {
        (cleaned as any).liveCodeVerdict = undefined
      }
      
      // Ensure arrays are arrays
      if (!Array.isArray((cleaned as any).anotherTech)) {
        (cleaned as any).anotherTech = []
      }
      
      // Clean empty strings to undefined for optional fields
      const optionalStringFields = ['project', 'interviewerId', 'professionalExperience', 
                                   'mainLanguage', 'database', 'cloud', 'liveCodeResult', 'mirror']
      optionalStringFields.forEach(field => {
        if ((cleaned as any)[field] === "") {
          (cleaned as any)[field] = undefined
        }
      })
      
      return cleaned
    }

    return {
      candidates: candidates.map(c => {
        try {
          return CandidateSchema.parse(cleanCandidateData(c))
        } catch (error) {
          console.error('Error parsing candidate:', c._id, error)
          // Return a basic valid candidate structure if parsing fails
          return {
            _id: c._id.toString(),
            name: c.name || 'Unknown',
            email: c.email || 'unknown@example.com',
            role: c.role || 'Unknown Role',
            project: c.project || undefined,
            interviewerId: c.interviewerId || undefined,
            interviewSchedule: c.interviewSchedule || undefined,
            professionalExperience: c.professionalExperience || undefined,
            mainLanguage: c.mainLanguage || undefined,
            database: c.database || undefined,
            cloud: c.cloud || undefined,
            anotherTech: Array.isArray(c.anotherTech) ? c.anotherTech : [],
            liveCodeResult: c.liveCodeResult || undefined,
            status: c.status || 'APPLIED',
            level: ['Junior', 'Mid', 'Senior'].includes(c.level) ? c.level : undefined,
            mirror: c.mirror || undefined,
            liveCodeVerdict: ['PASS', 'FAIL', 'ON_HOLD'].includes(c.liveCodeVerdict) ? c.liveCodeVerdict : undefined,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            deletedAt: c.deletedAt
          }
        }
      }),
      total
    }
  }

  async getCandidateById(id: string): Promise<Candidate | null> {
    const db = await this.getDb()
    const candidate = await db.collection('candidates').findOne({ 
      _id: new ObjectId(id),
      deletedAt: null 
    })
    if (!candidate) return null
    
    // Use the same cleaning logic
    const cleaned = { ...candidate, _id: candidate._id.toString() }
    
    // Clean optional enum fields
    if ((cleaned as any).level === "" || (cleaned as any).level === null || 
        !['Junior', 'Mid', 'Senior'].includes((cleaned as any).level)) {
      (cleaned as any).level = undefined
    }
    
    if ((cleaned as any).liveCodeVerdict === "" || (cleaned as any).liveCodeVerdict === null ||
        !['PASS', 'FAIL', 'ON_HOLD'].includes((cleaned as any).liveCodeVerdict)) {
      (cleaned as any).liveCodeVerdict = undefined
    }
    
    // Ensure arrays are arrays
    if (!Array.isArray((cleaned as any).anotherTech)) {
      (cleaned as any).anotherTech = []
    }
    
    // Clean empty strings for optional fields
    const optionalStringFields = ['project', 'interviewerId', 'professionalExperience', 
                                 'mainLanguage', 'database', 'cloud', 'liveCodeResult', 'mirror']
    optionalStringFields.forEach(field => {
      if ((cleaned as any)[field] === "") {
        (cleaned as any)[field] = undefined
      }
    })
    
    try {
      return CandidateSchema.parse(cleaned)
    } catch (error) {
      console.error('Error parsing candidate by ID:', id, error)
      return null
    }
  }

  async getCandidateByEmail(email: string): Promise<Candidate | null> {
    const db = await this.getDb()
    const candidate = await db.collection('candidates').findOne({ 
      email,
      deletedAt: null 
    })
    if (!candidate) return null
    
    // Use the same cleaning logic
    const cleaned = { ...candidate, _id: candidate._id.toString() }
    
    // Clean optional enum fields
    if ((cleaned as any).level === "" || (cleaned as any).level === null || 
        !['Junior', 'Mid', 'Senior'].includes((cleaned as any).level)) {
      (cleaned as any).level = undefined
    }
    
    if ((cleaned as any).liveCodeVerdict === "" || (cleaned as any).liveCodeVerdict === null ||
        !['PASS', 'FAIL', 'ON_HOLD'].includes((cleaned as any).liveCodeVerdict)) {
      (cleaned as any).liveCodeVerdict = undefined
    }
    
    // Ensure arrays are arrays
    if (!Array.isArray((cleaned as any).anotherTech)) {
      (cleaned as any).anotherTech = []
    }
    
    // Clean empty strings for optional fields
    const optionalStringFields = ['project', 'interviewerId', 'professionalExperience', 
                                 'mainLanguage', 'database', 'cloud', 'liveCodeResult', 'mirror']
    optionalStringFields.forEach(field => {
      if ((cleaned as any)[field] === "") {
        (cleaned as any)[field] = undefined
      }
    })
    
    try {
      return CandidateSchema.parse(cleaned)
    } catch (error) {
      console.error('Error parsing candidate by email:', email, error)
      return null
    }
  }

  async updateCandidate(id: string, updates: Partial<Candidate>) {
    const db = await this.getDb()
    const result = await db.collection('candidates').updateOne(
      { _id: new ObjectId(id), deletedAt: null },
      { $set: { ...updates, updatedAt: new Date() } }
    )
    return result.modifiedCount > 0
  }

  async softDeleteCandidate(id: string) {
    const db = await this.getDb()
    const result = await db.collection('candidates').updateOne(
      { _id: new ObjectId(id) },
      { $set: { deletedAt: new Date() } }
    )
    return result.modifiedCount > 0
  }

  async searchCandidates(searchTerm: string, filters: any = {}) {
    const db = await this.getDb()
    const searchRegex = new RegExp(searchTerm, 'i')
    
    const query = {
      deletedAt: null,
      ...filters,
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { professionalExperience: searchRegex },
        { role: searchRegex }
      ]
    }
    
    const candidates = await db.collection('candidates')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()
    
    // Use the same cleaning logic as getCandidates
    return candidates.map(c => {
      const cleaned = { ...c, _id: c._id.toString() }
      
      // Clean optional enum fields
      if ((cleaned as any).level === "" || (cleaned as any).level === null || 
          !['Junior', 'Mid', 'Senior'].includes((cleaned as any).level)) {
        (cleaned as any).level = undefined
      }
      
      if ((cleaned as any).liveCodeVerdict === "" || (cleaned as any).liveCodeVerdict === null ||
          !['PASS', 'FAIL', 'ON_HOLD'].includes((cleaned as any).liveCodeVerdict)) {
        (cleaned as any).liveCodeVerdict = undefined
      }
      
      // Ensure arrays are arrays
      if (!Array.isArray((cleaned as any).anotherTech)) {
        (cleaned as any).anotherTech = []
      }
      
      // Clean empty strings for optional fields
      const optionalStringFields = ['project', 'interviewerId', 'professionalExperience', 
                                   'mainLanguage', 'database', 'cloud', 'liveCodeResult', 'mirror']
      optionalStringFields.forEach(field => {
        if ((cleaned as any)[field] === "") {
          (cleaned as any)[field] = undefined
        }
      })
      
      try {
        return CandidateSchema.parse(cleaned)
      } catch (error) {
        console.error('Error parsing candidate in search:', c._id, error)
        // Return a fallback valid candidate
        return {
          _id: c._id.toString(),
          name: c.name || 'Unknown',
          email: c.email || 'unknown@example.com',
          role: c.role || 'Unknown Role',
          status: c.status || 'APPLIED',
          anotherTech: [],
          level: undefined,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          deletedAt: c.deletedAt
        }
      }
    })
  }

  // Notes operations
  async createNote(note: Omit<Note, '_id' | 'createdAt'>) {
    const db = await this.getDb()
    const newNote = {
      ...note,
      createdAt: new Date()
    }
    
    const result = await db.collection('notes').insertOne(newNote)
    return { ...newNote, _id: result.insertedId.toString() }
  }

  async getNotesByCandidate(candidateId: string) {
    const db = await this.getDb()
    const notes = await db.collection('notes')
      .find({ candidateId })
      .sort({ createdAt: -1 })
      .toArray()
    
    return notes.map(n => NoteSchema.parse({ ...n, _id: n._id.toString() }))
  }

  async getNoteById(id: string): Promise<Note | null> {
    try {
      const db = await this.getDb()
      const note = await db.collection('notes').findOne({ _id: new ObjectId(id) })
      
      if (!note) return null
      
      return NoteSchema.parse({ ...note, _id: note._id.toString() })
    } catch (error) {
      console.error('Error getting note by ID:', error)
      return null
    }
  }

  async deleteNote(id: string): Promise<boolean> {
    try {
      const db = await this.getDb()
      const result = await db.collection('notes').deleteOne({ _id: new ObjectId(id) })
      return result.deletedCount > 0
    } catch (error) {
      console.error('Error deleting note:', error)
      return false
    }
  }

  // Audit operations
  async createAuditLog(audit: Omit<Audit, '_id' | 'createdAt'>) {
    const db = await this.getDb()
    const newAudit = {
      ...audit,
      createdAt: new Date()
    }
    
    const result = await db.collection('audit').insertOne(newAudit)
    return { ...newAudit, _id: result.insertedId.toString() }
  }

  async getAuditLogs(entityId: string, entityType: string) {
    const db = await this.getDb()
    const logs = await db.collection('audit')
      .find({ entityId, entityType })
      .sort({ createdAt: -1 })
      .toArray()
    
    return logs.map(l => AuditSchema.parse({ ...l, _id: l._id.toString() }))
  }

  async getAuditLogsByActor(actorId: string) {
    const db = await this.getDb()
    const logs = await db.collection('audit').find({ actorId }).sort({ createdAt: -1 }).toArray()
    
    return logs.map(log => AuditSchema.parse({ ...log, _id: log._id.toString() }))
  }

  // Reports
  async getReportSummary() {
    const db = await this.getDb()
    
    const pipeline = [
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]
    
    const statusCounts = await db.collection('candidates').aggregate(pipeline).toArray()
    const total = await db.collection('candidates').countDocuments({ deletedAt: null })
    
    return {
      total,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {} as Record<string, number>)
    }
  }

  // Bulk operations
  async bulkCreateCandidates(candidates: Omit<Candidate, '_id' | 'createdAt' | 'updatedAt'>[]) {
    const db = await this.getDb()
    const now = new Date()
    
    const docs = candidates.map(c => ({
      ...c,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    }))
    
    const result = await db.collection('candidates').insertMany(docs)
    return result.insertedIds
  }

  async bulkUpdateCandidates(updates: { id: string, changes: Partial<Candidate> }[]) {
    const db = await this.getDb()
    const now = new Date()
    
    const operations = updates.map(({ id, changes }) => ({
      updateOne: {
        filter: { _id: new ObjectId(id), deletedAt: null },
        update: { $set: { ...changes, updatedAt: now } }
      }
    }))
    
    const result = await db.collection('candidates').bulkWrite(operations)
    return result.modifiedCount
  }
}

export const db = new DatabaseService()
