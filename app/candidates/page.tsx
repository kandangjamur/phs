"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Plus } from "lucide-react"
import { Candidate } from "@/lib/models"
import { toast } from "sonner"
import Link from "next/link"
import { columns } from "./columns"

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch candidates when debounced search term or page changes
  useEffect(() => {
    fetchCandidates()
  }, [currentPage, debouncedSearchTerm])

  const fetchCandidates = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      })
      
      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm)
      }

      const response = await fetch(`/api/candidates?${params}`)
      if (!response.ok) throw new Error("Failed to fetch candidates")
      
      const data = await response.json()
      setCandidates(data.candidates || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching candidates:", error)
      toast.error("Failed to load candidates")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }, [])

  if (isLoading) {
    return (
      <div className="p-6 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Candidates</h1>
          <Link href="/candidates/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Candidate
            </Button>
          </Link>
        </div>


      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Candidates ({candidates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={candidates}
            searchKey="candidates"
            searchValue={searchTerm}
            onSearchChange={handleSearch}
            pagination={{
              pageIndex: currentPage - 1,
              pageSize: 10,
              pageCount: totalPages,
              total: candidates.length,
              onPreviousPage: () => setCurrentPage(p => Math.max(1, p - 1)),
              onNextPage: () => setCurrentPage(p => Math.min(totalPages, p + 1)),
              canPreviousPage: currentPage > 1,
              canNextPage: currentPage < totalPages,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

