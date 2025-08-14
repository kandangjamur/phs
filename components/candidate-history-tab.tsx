"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, User } from "lucide-react"
import { Audit } from "@/lib/models"

interface CandidateHistoryTabProps {
  candidateId: string
}

export function CandidateHistoryTab({ candidateId }: CandidateHistoryTabProps) {
  const [auditLogs, setAuditLogs] = useState<Audit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAuditLogs()
  }, [candidateId])

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/audit?entityId=${candidateId}&entityType=candidate`)
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data)
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString() + " at " + d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-green-100 text-green-800"
      case "updated":
        return "bg-blue-100 text-blue-800"
      case "deleted":
        return "bg-red-100 text-red-800"
      case "note_added":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return "✨"
      case "updated":
        return "📝"
      case "deleted":
        return "🗑️"
      case "note_added":
        return "💬"
      default:
        return "⚡"
    }
  }

  const renderDiffDetails = (diff: Record<string, any>) => {
    if (!diff || Object.keys(diff).length === 0) return null

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
        <div className="font-medium text-gray-700 mb-2">Changes:</div>
        {Object.entries(diff).map(([field, change]) => (
          <div key={field} className="mb-1">
            <span className="font-medium text-gray-600">{field}:</span>
            {typeof change === 'object' && change.before !== undefined && change.after !== undefined ? (
              <div className="ml-4">
                <div className="text-red-600">- {change.before || '(empty)'}</div>
                <div className="text-green-600">+ {change.after || '(empty)'}</div>
              </div>
            ) : (
              <span className="ml-2 text-gray-700">{JSON.stringify(change)}</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activity history...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
              <p className="text-gray-600">
                Activity and changes will appear here as they happen.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log._id} className="border-l-4 border-blue-200 pl-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge 
                          variant="secondary" 
                          className={getActionBadgeColor(log.action)}
                        >
                          <span className="mr-1">{getActionIcon(log.action)}</span>
                          {log.action.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          {log.actorName}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-2">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {formatDate(log.createdAt!)}
                      </div>

                      {log.diff && renderDiffDetails(log.diff)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

