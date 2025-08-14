"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { StatusBadge, LevelBadge, TechBadge } from "@/components/ui/status-badge"
import { Edit2, Save, X, Plus } from "lucide-react"
import { Candidate, CandidateStatus, CandidateLevel } from "@/lib/models"

interface CandidateProfileTabProps {
  candidate: Candidate
  onUpdate: (updates: Partial<Candidate>) => void
}

export function CandidateProfileTab({ candidate, onUpdate }: CandidateProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: candidate.name,
    email: candidate.email,
    role: candidate.role,
    project: candidate.project || "",
    professionalExperience: candidate.professionalExperience || "",
    mainLanguage: candidate.mainLanguage || "",
    database: candidate.database || "",
    cloud: candidate.cloud || "",
    anotherTech: candidate.anotherTech || [],
    status: candidate.status,
    level: candidate.level || "",
    mirror: candidate.mirror || "",
    liveCodeResult: candidate.liveCodeResult || ""
  })
  const [newTech, setNewTech] = useState("")

  const handleSave = () => {
    // Convert empty string level to undefined to match schema
    const updateData = {
      ...formData,
      level: formData.level === "" ? undefined : formData.level as "Junior" | "Mid" | "Senior" | undefined
    }
    onUpdate(updateData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: candidate.name,
      email: candidate.email,
      role: candidate.role,
      project: candidate.project || "",
      professionalExperience: candidate.professionalExperience || "",
      mainLanguage: candidate.mainLanguage || "",
      database: candidate.database || "",
      cloud: candidate.cloud || "",
      anotherTech: candidate.anotherTech || [],
      status: candidate.status,
      level: candidate.level || "",
      mirror: candidate.mirror || "",
      liveCodeResult: candidate.liveCodeResult || ""
    })
    setIsEditing(false)
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Basic Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Basic Information</CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                value={formData.project}
                onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                disabled={!isEditing}
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
                disabled={!isEditing}
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
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="experience">Professional Experience</Label>
            <Textarea
              id="experience"
              value={formData.professionalExperience}
              onChange={(e) => setFormData(prev => ({ ...prev, professionalExperience: e.target.value }))}
              disabled={!isEditing}
              rows={3}
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
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="database">Database</Label>
              <Input
                id="database"
                value={formData.database}
                onChange={(e) => setFormData(prev => ({ ...prev, database: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cloud">Cloud Platform</Label>
            <Input
              id="cloud"
              value={formData.cloud}
              onChange={(e) => setFormData(prev => ({ ...prev, cloud: e.target.value }))}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label>Additional Technologies</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {formData.anotherTech.map((tech, index) => (
                <div key={index} className="relative group">
                  <TechBadge tech={tech} />
                  {isEditing && (
                    <button
                      onClick={() => removeTech(tech)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  placeholder="Add technology"
                  onKeyPress={(e) => e.key === 'Enter' && addTech()}
                />
                <Button onClick={addTech} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="liveCodeResult">Live Code Result</Label>
            <Textarea
              id="liveCodeResult"
              value={formData.liveCodeResult}
              onChange={(e) => setFormData(prev => ({ ...prev, liveCodeResult: e.target.value }))}
              disabled={!isEditing}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
