"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RoleUpgradeBanner } from "@/components/role-upgrade-banner"
import { ArrowLeft, Upload, Download, AlertCircle, CheckCircle, FileText, X } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface ImportResult {
  row: number
  data?: any
  error?: string
  email?: string
}

interface ImportSummary {
  total: number
  success: number
  errors: number
  duplicates: number
}

export default function ImportCandidatesPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importResults, setImportResults] = useState<{
    success: ImportResult[]
    errors: ImportResult[]
    duplicates: ImportResult[]
  } | null>(null)
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null)

  const downloadTemplate = () => {
    const template = [
      'name,email,role,project,interviewer,interview_schedule,professional_experience,main_language,database,cloud,another_tech,live_code_result,status,level,mirror',
      'John Doe,john@example.com,Frontend Developer,E-commerce,Jane Smith,2024-01-15T10:00:00,5 years React experience,JavaScript,PostgreSQL,AWS,"React;TypeScript;Node.js",Good problem solving,APPLIED,Senior,team-lead',
      'Jane Smith,jane@example.com,Backend Developer,API Platform,,,"3 years Node.js",TypeScript,MongoDB,Azure,"Node.js;Express;GraphQL",,SCREENING,Mid,'
    ].join('\n')

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'candidates_import_template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    toast.success("Template downloaded")
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'))
    
    if (csvFile) {
      setSelectedFile(csvFile)
    } else {
      toast.error("Please drop a CSV file")
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file)
      } else {
        toast.error("Please select a CSV file")
        e.target.value = ""
      }
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first")
      return
    }

    setIsImporting(true)
    setImportResults(null)
    setImportSummary(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/candidates/import', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      
      setImportResults(result.results)
      setImportSummary(result.summary)

      if (response.ok || response.status === 207) { // 207 = Multi-status (partial success)
        if (result.summary.success > 0) {
          toast.success(`Successfully imported ${result.summary.success} candidates`)
        }
        if (result.summary.errors > 0 || result.summary.duplicates > 0) {
          toast.warning(`${result.summary.errors} errors, ${result.summary.duplicates} duplicates found`)
        }
      } else {
        toast.error(result.message || "Import failed with validation errors")
      }
    } catch (error) {
      console.error("Import error:", error)
      toast.error("Failed to import candidates")
    } finally {
      setIsImporting(false)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setImportResults(null)
    setImportSummary(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/candidates">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Candidates
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Import Candidates</h1>
        <p className="text-gray-600 mt-2">
          Upload a CSV file to bulk import candidates into the system
        </p>
      </div>

      <RoleUpgradeBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Upload CSV File
                <Button onClick={downloadTemplate} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div className="text-left">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button 
                        onClick={clearFile} 
                        variant="outline" 
                        size="sm"
                        className="ml-4"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={handleImport} 
                      disabled={isImporting}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isImporting ? "Importing..." : "Import Candidates"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium">Drop your CSV file here</p>
                      <p className="text-gray-600">or click to browse</p>
                    </div>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      Select File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Import Instructions */}
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>CSV Format Requirements:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Required fields: name, email, role</li>
                    <li>• Use semicolon (;) to separate multiple technologies</li>
                    <li>• Date format: YYYY-MM-DDTHH:mm:ss</li>
                    <li>• Status: APPLIED, SCREENING, INTERVIEW, PASSED, REJECTED, OFFER</li>
                    <li>• Level: Junior, Mid, Senior</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Summary Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Import Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {importSummary ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Total Rows:</span>
                    <Badge variant="outline">{importSummary.total}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Successful:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {importSummary.success}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Errors:</span>
                    <Badge className="bg-red-100 text-red-800">
                      {importSummary.errors}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Duplicates:</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {importSummary.duplicates}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No import data yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Section */}
      {importResults && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Errors */}
            {importResults.errors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-red-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Errors ({importResults.errors.length})
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importResults.errors.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell>{error.row}</TableCell>
                        <TableCell className="text-red-600">{error.error}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Duplicates */}
            {importResults.duplicates.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-yellow-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Duplicates ({importResults.duplicates.length})
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importResults.duplicates.map((duplicate, index) => (
                      <TableRow key={index}>
                        <TableCell>{duplicate.row}</TableCell>
                        <TableCell>{duplicate.email}</TableCell>
                        <TableCell className="text-yellow-600">{duplicate.error}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Success */}
            {importResults.success.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Successfully Imported ({importResults.success.length})
                </h3>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {importResults.success.length} candidates were successfully imported and can be found in the candidates list.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
