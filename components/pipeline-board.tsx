"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { KanbanProvider, KanbanColumn, KanbanItem } from "@/components/ui/kanban"
import { CandidateCard } from "./candidate-card"
import { Plus, Search, Upload, Download } from "lucide-react"
import { Candidate, CandidateStatus, CandidateLevel } from "@/lib/models"

interface PipelineBoardProps {
  candidates: Candidate[]
  onUpdateStatus: (candidateId: string, newStatus: string) => void
  onCreateCandidate: () => void
  onImportCSV: () => void
  onExportCSV: () => void
  isLoading?: boolean
}

const PIPELINE_COLUMNS = [
  { id: CandidateStatus.APPLIED, title: "Applied", color: "bg-blue-50 border-blue-200" },
  { id: CandidateStatus.SCREENING, title: "Screening", color: "bg-yellow-50 border-yellow-200" },
  { id: CandidateStatus.INTERVIEW, title: "Interview", color: "bg-purple-50 border-purple-200" },
  { id: CandidateStatus.PASSED, title: "Passed", color: "bg-green-50 border-green-200" },
  { id: CandidateStatus.OFFER, title: "Offer", color: "bg-emerald-50 border-emerald-200" },
  { id: CandidateStatus.REJECTED, title: "Rejected", color: "bg-red-50 border-red-200" },
]

export function PipelineBoard({
  candidates,
  onUpdateStatus,
  onCreateCandidate,
  onImportCSV,
  onExportCSV,
  isLoading = false
}: PipelineBoardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [filteredCandidates, setFilteredCandidates] = useState(candidates)

  // Filter candidates
  useEffect(() => {
    let filtered = candidates

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(search) ||
        candidate.email.toLowerCase().includes(search) ||
        candidate.role.toLowerCase().includes(search) ||
        candidate.professionalExperience?.toLowerCase().includes(search)
      )
    }

    if (levelFilter !== "all") {
      filtered = filtered.filter(candidate => candidate.level === levelFilter)
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(candidate =>
        candidate.role.toLowerCase().includes(roleFilter.toLowerCase())
      )
    }

    setFilteredCandidates(filtered)
  }, [candidates, searchTerm, levelFilter, roleFilter])

  // Convert candidates to kanban items
  const kanbanItems = filteredCandidates.map(candidate => ({
    id: candidate._id!,
    columnId: candidate.status,
    content: (
      <CandidateCard
        candidate={candidate}
        onUpdateStatus={onUpdateStatus}
      />
    )
  }))

  // Handle kanban item move
  const handleItemMove = (itemId: string, newColumnId: string) => {
    onUpdateStatus(itemId, newColumnId)
  }

  // Get unique roles for filter
  const uniqueRoles = [...new Set(candidates.map(c => c.role))]

  return (
    <div className="p-6 h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <h1 className="text-2xl font-bold">Hiring Pipeline</h1>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onImportCSV} variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Import CSV</span>
              <span className="sm:hidden">Import</span>
            </Button>
            <Button onClick={onExportCSV} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button onClick={onCreateCandidate} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Candidate</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value={CandidateLevel.Junior}>Junior</SelectItem>
                <SelectItem value={CandidateLevel.Mid}>Mid</SelectItem>
                <SelectItem value={CandidateLevel.Senior}>Senior</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {uniqueRoles.slice(0, 10).map(role => (
                  <SelectItem key={role} value={role} className="truncate">{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Badge variant="outline" className="whitespace-nowrap">
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="h-[calc(100vh-200px)]">
        <KanbanProvider
          columns={PIPELINE_COLUMNS}
          items={kanbanItems}
          onItemMove={handleItemMove}
        >
          {PIPELINE_COLUMNS.map(column => {
            const columnItems = kanbanItems.filter(item => item.columnId === column.id)
            
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                className="w-full sm:w-80"
              >
                {columnItems.map(item => (
                  <KanbanItem
                    key={item.id}
                    item={item}
                  />
                ))}
              </KanbanColumn>
            )
          })}
        </KanbanProvider>
      </div>
    </div>
  )
}

