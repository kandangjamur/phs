"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, X } from "lucide-react"
import { CandidateStatus, CandidateLevel } from "@/lib/models"
import { toast } from "sonner"
import Link from "next/link"

export default function NewCandidatePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    project: "",
    interviewerId: "",
    interviewSchedule: "",
    professionalExperience: "",
    mainLanguage: "",
    database: "",
    cloud: "",
    anotherTech: [] as string[],
    status: CandidateStatus.APPLIED,
    level: "",
    mirror: ""
  })
  const [newTech, setNewTech] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.role) {
      toast.error("Please fill in required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          level: formData.level || undefined,
          interviewerId: formData.interviewerId || undefined,
          interviewSchedule: formData.interviewSchedule || undefined
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create candidate")
      }

      const candidate = await response.json()
      toast.success("Candidate created successfully")
      router.push(`/candidates/${candidate._id}`)
    } catch (error) {
      console.error("Error creating candidate:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create candidate")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTech = () => {
    if (newTech.trim() && !formData.anotherTech.includes(newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        anotherTech: [...prev.anotherTech, newTech.trim()]
      }))
      setNewTech("")
    }
  }

  const removeTech = (techToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      anotherTech: prev.anotherTech.filter(tech => tech !== techToRemove)
    }))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/candidates">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Candidates
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add New Candidate</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Frontend Developer"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="project">Project</Label>
                  <Input
                    id="project"
                    value={formData.project}
                    onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                    placeholder="e.g. E-commerce Platform"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CandidateStatus).map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level || "unspecified"}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, level: value === "unspecified" ? "" : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unspecified">Not specified</SelectItem>
                      {Object.values(CandidateLevel).map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="mirror">Assignee (Mirror)</Label>
                <Input
                  id="mirror"
                  value={formData.mirror}
                  onChange={(e) => setFormData(prev => ({ ...prev, mirror: e.target.value }))}
                  placeholder="Assigned team member"
                />
              </div>

              {/* Interview Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interviewerId">Interviewer (Optional)</Label>
                  <Input
                    id="interviewerId"
                    value={formData.interviewerId}
                    onChange={(e) => setFormData(prev => ({ ...prev, interviewerId: e.target.value }))}
                    placeholder="Interviewer name or ID"
                  />
                </div>
                <div>
                  <Label htmlFor="interviewSchedule">Interview Schedule (Optional)</Label>
                  <Input
                    id="interviewSchedule"
                    type="datetime-local"
                    value={formData.interviewSchedule ? formData.interviewSchedule.slice(0, 16) : ""}
                    onChange={(e) => {
                      const value = e.target.value ? new Date(e.target.value).toISOString() : ""
                      setFormData(prev => ({ ...prev, interviewSchedule: value }))
                    }}
                    min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)} // 1 hour from now
                    max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)} // 1 year from now
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If scheduling now: Mon-Fri, 9 AM - 6 PM (can be updated later)
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="experience">Professional Experience</Label>
                <Textarea
                  id="experience"
                  value={formData.professionalExperience}
                  onChange={(e) => setFormData(prev => ({ ...prev, professionalExperience: e.target.value }))}
                  rows={3}
                  placeholder="Brief description of professional background..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mainLanguage">Main Language</Label>
                  <Input
                    id="mainLanguage"
                    value={formData.mainLanguage}
                    onChange={(e) => setFormData(prev => ({ ...prev, mainLanguage: e.target.value }))}
                    placeholder="e.g. JavaScript"
                  />
                </div>
                <div>
                  <Label htmlFor="database">Database</Label>
                  <Input
                    id="database"
                    value={formData.database}
                    onChange={(e) => setFormData(prev => ({ ...prev, database: e.target.value }))}
                    placeholder="e.g. PostgreSQL"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cloud">Cloud Platform</Label>
                <Input
                  id="cloud"
                  value={formData.cloud}
                  onChange={(e) => setFormData(prev => ({ ...prev, cloud: e.target.value }))}
                  placeholder="e.g. AWS"
                />
              </div>

              <div>
                <Label>Additional Technologies</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {formData.anotherTech.map((tech, index) => (
                    <div key={index} className="relative group">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-sm">
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTech(tech)}
                          className="ml-1 text-slate-500 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    placeholder="Add technology"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  />
                  <Button type="button" onClick={addTech} variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? "Creating..." : "Create Candidate"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
