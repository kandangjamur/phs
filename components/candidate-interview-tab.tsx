"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Download, Mail, User, FileText, Trash2 } from "lucide-react"
import { Candidate, LiveCodeVerdict } from "@/lib/models"
import { toast } from "sonner"

interface CandidateInterviewTabProps {
  candidate: Candidate
  onUpdate: (updates: Partial<Candidate>) => void
  onClearSchedule: () => void
}

export function CandidateInterviewTab({ candidate, onUpdate, onClearSchedule }: CandidateInterviewTabProps) {
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [isEditingResult, setIsEditingResult] = useState(false)
  
  const [scheduleData, setScheduleData] = useState({
    interviewSchedule: candidate.interviewSchedule ? 
      new Date(candidate.interviewSchedule).toISOString().slice(0, 16) : "",
    interviewerId: candidate.interviewerId || ""
  })

  const [resultData, setResultData] = useState({
    liveCodeResult: candidate.liveCodeResult || "",
    liveCodeVerdict: candidate.liveCodeVerdict || ""
  })

  const validateInterviewSchedule = (dateTimeString: string): { isValid: boolean, error?: string } => {
    if (!dateTimeString) {
      return { isValid: false, error: "Interview date and time is required" }
    }

    const selectedDate = new Date(dateTimeString)
    const now = new Date()
    
    // Check if date is valid
    if (isNaN(selectedDate.getTime())) {
      return { isValid: false, error: "Invalid date and time format" }
    }

    // Check if date is in the past (with 1 hour buffer to allow for current hour scheduling)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    if (selectedDate < oneHourFromNow) {
      return { isValid: false, error: "Interview cannot be scheduled in the past or within the next hour" }
    }

    // Check if date is too far in the future (1 year max)
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    if (selectedDate > oneYearFromNow) {
      return { isValid: false, error: "Interview cannot be scheduled more than 1 year in advance" }
    }

    // Check if it's during business hours (9 AM to 6 PM, Monday to Friday)
    const dayOfWeek = selectedDate.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hour = selectedDate.getHours()
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { isValid: false, error: "Interviews should be scheduled during weekdays (Monday-Friday)" }
    }

    if (hour < 9 || hour >= 18) {
      return { isValid: false, error: "Interviews should be scheduled during business hours (9 AM - 6 PM)" }
    }

    return { isValid: true }
  }

  const handleSaveSchedule = () => {
    // Validate interview schedule
    const validation = validateInterviewSchedule(scheduleData.interviewSchedule)
    
    if (!validation.isValid) {
      toast.error(validation.error || "Invalid interview schedule")
      return
    }

    // Validate interviewer (optional but recommended)
    if (!scheduleData.interviewerId.trim()) {
      toast.error("Interviewer name/ID is required")
      return
    }

    const updates: Partial<Candidate> = {}
    
    if (scheduleData.interviewSchedule) {
      updates.interviewSchedule = new Date(scheduleData.interviewSchedule).toISOString()
    }
    if (scheduleData.interviewerId) {
      updates.interviewerId = scheduleData.interviewerId.trim()
    }

    onUpdate(updates)
    setIsEditingSchedule(false)
    toast.success("Interview schedule updated successfully")
  }

  const handleSaveResult = () => {
    onUpdate({
      liveCodeResult: resultData.liveCodeResult,
      liveCodeVerdict: resultData.liveCodeVerdict as any
    })
    setIsEditingResult(false)
  }

  const generateICSFile = () => {
    if (!candidate.interviewSchedule) {
      toast.error("No interview scheduled")
      return
    }

    const startDate = new Date(candidate.interviewSchedule)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour later

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Hiring System//Interview//EN',
      'BEGIN:VEVENT',
      `UID:interview-${candidate._id}-${Date.now()}@hiring-system.com`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:Interview with ${candidate.name}`,
      `DESCRIPTION:Interview for ${candidate.role} position\\n\\nCandidate: ${candidate.name}\\nEmail: ${candidate.email}\\nProject: ${candidate.project || 'N/A'}`,
      `LOCATION:Virtual Meeting`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview-${candidate.name.replace(/\s+/g, '-')}.ics`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    toast.success("ICS file downloaded")
  }

  const generateGoogleCalendarLink = () => {
    if (!candidate.interviewSchedule) {
      toast.error("No interview scheduled")
      return
    }

    const startDate = new Date(candidate.interviewSchedule)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)

    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Interview with ${candidate.name}`,
      dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
      details: `Interview for ${candidate.role} position\n\nCandidate: ${candidate.name}\nEmail: ${candidate.email}\nProject: ${candidate.project || 'N/A'}`,
      location: 'Virtual Meeting'
    })

    const url = `https://calendar.google.com/calendar/render?${params.toString()}`
    window.open(url, '_blank')
  }

  const getVerdictBadgeColor = (verdict: string) => {
    switch (verdict) {
      case LiveCodeVerdict.PASS:
        return "bg-green-100 text-green-800"
      case LiveCodeVerdict.FAIL:
        return "bg-red-100 text-red-800"
      case LiveCodeVerdict.ON_HOLD:
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Interview Scheduling */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Interview Scheduling
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isEditingSchedule && candidate.interviewSchedule && (
              <Button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear the interview schedule?")) {
                    onClearSchedule()
                  }
                }} 
                variant="outline" 
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            {!isEditingSchedule && (
              <Button onClick={() => setIsEditingSchedule(true)} variant="outline" size="sm">
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditingSchedule ? (
            <>
              {candidate.interviewSchedule ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {new Date(candidate.interviewSchedule).toLocaleDateString()}
                    </span>
                    <span className="text-gray-600">at</span>
                    <span className="font-medium">
                      {new Date(candidate.interviewSchedule).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  {candidate.interviewerId && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Interviewer: {candidate.interviewerId}</span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button onClick={generateICSFile} variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download ICS
                    </Button>
                    <Button onClick={generateGoogleCalendarLink} variant="outline" size="sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      Google Calendar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>No interview scheduled</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="interviewDate">Interview Date & Time *</Label>
                <Input
                  id="interviewDate"
                  type="datetime-local"
                  value={scheduleData.interviewSchedule}
                  onChange={(e) => setScheduleData(prev => ({
                    ...prev,
                    interviewSchedule: e.target.value
                  }))}
                  min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)} // 1 hour from now
                  max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)} // 1 year from now
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Schedule during business hours: Mon-Fri, 9 AM - 6 PM
                </p>
              </div>
              
              <div>
                <Label htmlFor="interviewer">Interviewer *</Label>
                <Input
                  id="interviewer"
                  value={scheduleData.interviewerId}
                  onChange={(e) => setScheduleData(prev => ({
                    ...prev,
                    interviewerId: e.target.value
                  }))}
                  placeholder="Enter interviewer name or ID"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveSchedule} size="sm">
                  Save Schedule
                </Button>
                <Button 
                  onClick={() => setIsEditingSchedule(false)} 
                  variant="outline" 
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Coding Results */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Live Coding Results
          </CardTitle>
          {!isEditingResult && (
            <Button onClick={() => setIsEditingResult(true)} variant="outline" size="sm">
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditingResult ? (
            <>
              {candidate.liveCodeVerdict && (
                <div className="mb-4">
                  <Label className="text-sm font-medium text-gray-700">Verdict</Label>
                  <div className="mt-1">
                    <Badge className={getVerdictBadgeColor(candidate.liveCodeVerdict)}>
                      {candidate.liveCodeVerdict}
                    </Badge>
                  </div>
                </div>
              )}
              
              {candidate.liveCodeResult ? (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Results & Notes</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">
                    {candidate.liveCodeResult}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>No coding results recorded</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="verdict">Verdict</Label>
                <Select
                  value={resultData.liveCodeVerdict || "not_evaluated"}
                  onValueChange={(value) => setResultData(prev => ({
                    ...prev,
                    liveCodeVerdict: value === "not_evaluated" ? "" : value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select verdict" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_evaluated">Not evaluated</SelectItem>
                    {Object.values(LiveCodeVerdict).map(verdict => (
                      <SelectItem key={verdict} value={verdict}>
                        {verdict}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="liveCodeResult">Results & Notes</Label>
                <Textarea
                  id="liveCodeResult"
                  value={resultData.liveCodeResult}
                  onChange={(e) => setResultData(prev => ({
                    ...prev,
                    liveCodeResult: e.target.value
                  }))}
                  rows={6}
                  placeholder="Enter live coding results, observations, and feedback..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveResult} size="sm">
                  Save Results
                </Button>
                <Button 
                  onClick={() => setIsEditingResult(false)} 
                  variant="outline" 
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
