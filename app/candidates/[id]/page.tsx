"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge, LevelBadge, TechBadge } from "@/components/ui/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarDays, Mail, User, Briefcase, Clock, MessageSquare, Trash2 } from "lucide-react"
import { Candidate, Note } from "@/lib/models"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CandidateProfileTab } from "@/components/candidate-profile-tab"
import { CandidateNotesTab } from "@/components/candidate-notes-tab"
import { CandidateHistoryTab } from "@/components/candidate-history-tab"
import { CandidateInterviewTab } from "@/components/candidate-interview-tab"

export default function CandidateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (id) {
      fetchCandidate()
      fetchNotes()
    }
  }, [id])

  const fetchCandidate = async () => {
    try {
      const response = await fetch(`/api/candidates/${id}`)
      if (!response.ok) throw new Error("Failed to fetch candidate")
      
      const data = await response.json()
      setCandidate(data)
    } catch (error) {
      console.error("Error fetching candidate:", error)
      toast.error("Failed to load candidate")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/candidates/${id}/notes`)
      if (!response.ok) throw new Error("Failed to fetch notes")
      
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      console.error("Error fetching notes:", error)
    }
  }

  const handleUpdateCandidate = async (updates: Partial<Candidate>) => {
    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error("Failed to update candidate")

      const updatedCandidate = await response.json()
      setCandidate(updatedCandidate)
      toast.success("Candidate updated successfully")
    } catch (error) {
      console.error("Error updating candidate:", error)
      toast.error("Failed to update candidate")
    }
  }

  const handleAddNote = async (body: string) => {
    try {
      const response = await fetch(`/api/candidates/${id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body }),
      })

      if (!response.ok) throw new Error("Failed to add note")

      const newNote = await response.json()
      setNotes(prev => [newNote, ...prev])
      toast.success("Note added successfully")
    } catch (error) {
      console.error("Error adding note:", error)
      toast.error("Failed to add note")
    }
  }

  const handleDeleteCandidate = async () => {
    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete candidate")

      toast.success("Candidate deleted successfully")
      router.push("/candidates")
    } catch (error) {
      console.error("Error deleting candidate:", error)
      toast.error("Failed to delete candidate")
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete note")

      toast.success("Note deleted successfully")
      // Refresh notes
      fetchNotes()
    } catch (error) {
      console.error("Error deleting note:", error)
      toast.error("Failed to delete note")
    }
  }

  const handleClearInterviewSchedule = async () => {
    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewSchedule: null,
          interviewerId: null
        }),
      })

      if (!response.ok) throw new Error("Failed to clear interview schedule")

      const updatedCandidate = await response.json()
      setCandidate(updatedCandidate)
      toast.success("Interview schedule cleared successfully")
    } catch (error) {
      console.error("Error clearing interview schedule:", error)
      toast.error("Failed to clear interview schedule")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="p-6 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidate...</p>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="p-6 h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Candidate not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                  {getInitials(candidate.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{candidate.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{candidate.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{candidate.role}</span>
                  {candidate.project && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{candidate.project}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={candidate.status} />
                {candidate.level && <LevelBadge level={candidate.level} />}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Candidate
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="interview">Interview</TabsTrigger>
          <TabsTrigger value="notes" className="relative">
            Notes
            {notes.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {notes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <CandidateProfileTab
            candidate={candidate}
            onUpdate={handleUpdateCandidate}
          />
        </TabsContent>

        <TabsContent value="interview" className="mt-6">
                    <CandidateInterviewTab 
            candidate={candidate}
            onUpdate={handleUpdateCandidate}
            onClearSchedule={handleClearInterviewSchedule}
          />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
                    <CandidateNotesTab 
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <CandidateHistoryTab candidateId={id} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Candidate</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{candidate.name}</strong>? 
              This will permanently remove the candidate and all associated data including notes and interview history.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteCandidate()
                  setShowDeleteDialog(false)
                }}
              >
                Delete Candidate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
