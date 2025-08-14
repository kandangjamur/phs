import { Badge } from "@/components/ui/badge"
import { CandidateStatus } from "@/lib/models"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case CandidateStatus.APPLIED:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case CandidateStatus.SCREENING:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case CandidateStatus.INTERVIEW:
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case CandidateStatus.PASSED:
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case CandidateStatus.OFFER:
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
      case CandidateStatus.REJECTED:
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case CandidateStatus.APPLIED:
        return "📋"
      case CandidateStatus.SCREENING:
        return "👁️"
      case CandidateStatus.INTERVIEW:
        return "💬"
      case CandidateStatus.PASSED:
        return "✅"
      case CandidateStatus.OFFER:
        return "🎉"
      case CandidateStatus.REJECTED:
        return "❌"
      default:
        return "❓"
    }
  }

  return (
    <Badge 
      variant="secondary" 
      className={cn(getStatusStyle(status), className)}
    >
      <span className="mr-1">{getStatusIcon(status)}</span>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  )
}

export function LevelBadge({ level, className }: { level?: string; className?: string }) {
  if (!level) return null
  
  const getLevelStyle = (level: string) => {
    switch (level) {
      case "Junior":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "Mid":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"  
      case "Senior":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(getLevelStyle(level), className)}
    >
      {level}
    </Badge>
  )
}

export function TechBadge({ tech, className }: { tech: string; className?: string }) {
  return (
    <Badge 
      variant="outline" 
      className={cn("bg-slate-50 text-slate-700 hover:bg-slate-100", className)}
      title={tech}
    >
      {tech}
    </Badge>
  )
}

