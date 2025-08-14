"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Clock, Target, BarChart3, PieChart } from "lucide-react"

interface ReportData {
  totalCandidates: number
  statusBreakdown: Record<string, number>
  conversionRates: {
    applicationToScreening: number
    screeningToInterview: number
    interviewToPass: number
    overallPassRate: number
  }
  pipeline: {
    inProgress: number
    completed: number
    pending: number
  }
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/reports/summary")
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load report data</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPLIED":
        return "bg-blue-100 text-blue-800"
      case "SCREENING":
        return "bg-yellow-100 text-yellow-800"
      case "INTERVIEW":
        return "bg-purple-100 text-purple-800"
      case "PASSED":
        return "bg-green-100 text-green-800"
      case "OFFER":
        return "bg-emerald-100 text-emerald-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Overview of hiring pipeline performance and candidate metrics
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">
              All candidates in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.pipeline.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Active in pipeline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Pass Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.conversionRates.overallPassRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Candidates who passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.pipeline.completed}</div>
            <p className="text-xs text-muted-foreground">
              Finished processes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Pipeline Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(reportData.statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(status)}>
                      {status}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {count} candidate{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{count}</div>
                    <div className="text-xs text-gray-500">
                      {reportData.totalCandidates > 0 
                        ? ((count / reportData.totalCandidates) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Conversion Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Application → Screening</span>
                  <span className="text-sm font-bold">
                    {reportData.conversionRates.applicationToScreening.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, reportData.conversionRates.applicationToScreening)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Screening → Interview</span>
                  <span className="text-sm font-bold">
                    {reportData.conversionRates.screeningToInterview.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, reportData.conversionRates.screeningToInterview)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Interview → Pass</span>
                  <span className="text-sm font-bold">
                    {reportData.conversionRates.interviewToPass.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, reportData.conversionRates.interviewToPass)}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Success Rate</span>
                  <span className="text-lg font-bold text-green-600">
                    {reportData.conversionRates.overallPassRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, reportData.conversionRates.overallPassRate)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Health */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pipeline Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {reportData.pipeline.pending}
              </div>
              <div className="text-sm text-gray-600">Pending Review</div>
              <div className="text-xs text-gray-500 mt-1">
                Candidates awaiting next stage
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {reportData.pipeline.inProgress}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
              <div className="text-xs text-gray-500 mt-1">
                Active in interview process
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {reportData.pipeline.completed}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
              <div className="text-xs text-gray-500 mt-1">
                Passed, offered, or rejected
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

