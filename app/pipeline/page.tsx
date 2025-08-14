"use client"

import { useState, useEffect } from "react"
import { PipelineBoard } from "@/components/pipeline-board"
import { RoleUpgradeBanner } from "@/components/role-upgrade-banner"
import { Candidate } from "@/lib/models"
import { toast } from "sonner"

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch candidates
  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/candidates")
      if (!response.ok) throw new Error("Failed to fetch candidates")
      
      const data = await response.json()
      setCandidates(data.candidates || [])
    } catch (error) {
      console.error("Error fetching candidates:", error)
      toast.error("Failed to load candidates")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (candidateId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update candidate")

      const updatedCandidate = await response.json()
      
      setCandidates(prev =>
        prev.map(candidate =>
          candidate._id === candidateId ? updatedCandidate : candidate
        )
      )
      
      toast.success("Candidate status updated")
    } catch (error) {
      console.error("Error updating candidate:", error)
      toast.error("Failed to update candidate status")
    }
  }

  const handleCreateCandidate = () => {
    window.location.href = "/candidates/new"
  }

  const handleImportCSV = () => {
    window.location.href = "/candidates/import"
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/candidates/export")
      if (!response.ok) throw new Error("Failed to export candidates")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `candidates_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success("Candidates exported successfully")
    } catch (error) {
      console.error("Error exporting candidates:", error)
      toast.error("Failed to export candidates")
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pipeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <RoleUpgradeBanner />
      <PipelineBoard
        candidates={candidates}
        onUpdateStatus={handleUpdateStatus}
        onCreateCandidate={handleCreateCandidate}
        onImportCSV={handleImportCSV}
        onExportCSV={handleExportCSV}
        isLoading={isLoading}
      />
    </div>
  )
}
