"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ShieldCheck, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export function RoleUpgradeBanner() {
  const [needsUpgrade, setNeedsUpgrade] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)

  useEffect(() => {
    // Check if user needs role upgrade by trying to access a protected endpoint
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    try {
      const response = await fetch('/api/candidates', { method: 'HEAD' })
      if (response.status === 403) {
        setNeedsUpgrade(true)
      }
    } catch (error) {
      console.error('Error checking user role:', error)
    }
  }

  const upgradeRole = async () => {
    setIsUpgrading(true)
    try {
      const response = await fetch('/api/users/upgrade-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Role upgraded successfully! Please refresh the page.')
        setNeedsUpgrade(false)
        // Refresh the page after a short delay
        setTimeout(() => window.location.reload(), 2000)
      } else {
        throw new Error('Failed to upgrade role')
      }
    } catch (error) {
      console.error('Error upgrading role:', error)
      toast.error('Failed to upgrade role. Please contact an administrator.')
    } finally {
      setIsUpgrading(false)
    }
  }

  if (!needsUpgrade) return null

  return (
    <Alert className="mb-4 border-yellow-200 bg-yellow-50">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong>Limited Access:</strong> You have viewer permissions only. 
          Upgrade your role to access all features including candidate import/export.
        </div>
        <Button 
          onClick={upgradeRole} 
          disabled={isUpgrading}
          size="sm"
          className="ml-4"
        >
          <ShieldCheck className="mr-2 h-4 w-4" />
          {isUpgrading ? "Upgrading..." : "Upgrade Role"}
        </Button>
      </AlertDescription>
    </Alert>
  )
}

