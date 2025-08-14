import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { StatusBadge, LevelBadge, TechBadge } from "@/components/ui/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Calendar, MessageSquare, Edit } from "lucide-react"
import { Candidate } from "@/lib/models"
import Link from "next/link"

interface CandidateCardProps {
  candidate: Candidate
  onUpdateStatus?: (candidateId: string, newStatus: string) => void
  onScheduleInterview?: (candidateId: string) => void
  isDragging?: boolean
}

export function CandidateCard({ 
  candidate, 
  onUpdateStatus, 
  onScheduleInterview,
  isDragging = false 
}: CandidateCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className={`w-full mb-3 cursor-pointer hover:shadow-md transition-shadow ${
      isDragging ? 'opacity-50 rotate-2' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Link href={`/candidates/${candidate._id}`}>
                <h3 className="font-semibold text-sm hover:underline truncate">
                  {candidate.name}
                </h3>
              </Link>
              <p className="text-xs text-gray-600 truncate">{candidate.email}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/candidates/${candidate._id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onScheduleInterview?.(candidate._id!)}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interview
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/candidates/${candidate._id}#notes`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Note
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 break-words">
              {candidate.role}
            </p>
            {candidate.project && (
              <p className="text-xs text-gray-600 break-words line-clamp-2">
                {candidate.project}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1">
            <StatusBadge status={candidate.status} />
            <LevelBadge level={candidate.level || undefined} />
          </div>
          
          {candidate.anotherTech && candidate.anotherTech.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {candidate.anotherTech.slice(0, 2).map((tech, index) => (
                <TechBadge key={index} tech={tech} className="text-xs truncate max-w-20" />
              ))}
              {candidate.anotherTech.length > 2 && (
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                  +{candidate.anotherTech.length - 2}
                </span>
              )}
            </div>
          )}
          
          {candidate.interviewSchedule && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {new Date(candidate.interviewSchedule).toLocaleDateString()} at{" "}
                {new Date(candidate.interviewSchedule).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
          
          {candidate.professionalExperience && (
            <p className="text-xs text-gray-600 line-clamp-2 break-words">
              {candidate.professionalExperience}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

