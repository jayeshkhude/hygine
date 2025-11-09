'use client'

import { useState, useEffect } from 'react'
import { Upload, MapPin, AlertTriangle, Calendar, BarChart3, Plus, Menu, Home as HomeIcon } from 'lucide-react'
import { CSVReader } from './components/CSVReader'
import { RiskMap } from './components/RiskMap'
import { SummaryCards } from './components/SummaryCards'
import { Charts } from './components/Charts'
import { DataTable } from './components/DataTable'
import { Sidebar } from './components/Sidebar'
import { ReportForm } from './components/ReportForm'
import { LandingPage } from './components/LandingPage'
import { Report, ReportFormData } from './types'

interface Filters {
  riskLevels: string[]
  dateRange: [Date, Date]
  areas: string[]
}

export default function Home() {
  const [showLanding, setShowLanding] = useState(true)
  const [data, setData] = useState<Report[]>([])
  const [filteredData, setFilteredData] = useState<Report[]>([])
  const [filters, setFilters] = useState<Filters>({
    riskLevels: ['high', 'medium', 'low'],
    dateRange: [new Date(), new Date()],
    areas: []
  })
  const [isReportFormOpen, setIsReportFormOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)

  // Fetch reports on component mount
  useEffect(() => {
    if (!showLanding) {
      fetchReports()
    }
  }, [showLanding])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports')
      if (response.ok) {
        const data = await response.json()
        setData(data.reports || [])
        setFilteredData(data.reports || [])
        
        // Update area filters
        const areas = Array.from(new Set(data.reports?.map((item: Report) => item.locationText.split(',')[0].trim()) || [])).filter((area): area is string => typeof area === 'string')
        setFilters(prev => ({ ...prev, areas }))
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDataUpload = async (csvData: any[]) => {
    setLoading(true)
    
    try {
      // Geocode all locations sequentially to respect rate limits
      const geocodedResults: Array<{ lat: number; lng: number } | null> = []
      
      for (const row of csvData) {
        const location = row.location || ''
        if (!location) {
          geocodedResults.push(null)
          continue
        }
        
        try {
          const response = await fetch('/api/geocode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ locationText: location }),
          })
          
          if (response.ok) {
            const geocoded = await response.json()
            geocodedResults.push({
              lat: geocoded.lat,
              lng: geocoded.lng
            })
          } else {
            console.warn('Failed to geocode location:', location)
            geocodedResults.push(null)
          }
        } catch (error) {
          console.error('Geocoding error for location:', location, error)
          geocodedResults.push(null)
        }
        
        // Add delay between requests (1.1 seconds) to respect rate limits
        // Don't delay after the last request
        if (geocodedResults.length < csvData.length) {
          await new Promise(resolve => setTimeout(resolve, 1100))
        }
      }
      
      // Convert CSV data to the new Report format with geocoded coordinates
      const processedData: Report[] = []
      
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i]
        const geocoded = geocodedResults[i]
        
        // Only include reports that were successfully geocoded
        if (!geocoded) continue
        
        processedData.push({
          id: crypto.randomUUID(),
          userId: 'csv_import',
          createdAt: new Date().toISOString(),
          date: row.date || new Date().toISOString().split('T')[0],
          locationText: row.location || '',
          lat: geocoded.lat,
          lng: geocoded.lng,
          category: 'garbage' as const, // Default category
          risk: 'low' as const, // Default risk
          riskScore: 3, // Default score
          expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(),
          photoUrl: undefined,
          status: 'active' as const
        })
      }
      
      setData(processedData)
      setFilteredData(processedData)
      
      // Update area filters
      const areas = Array.from(new Set(processedData.map(item => item.locationText.split(',')[0].trim())))
      setFilters(prev => ({ ...prev, areas }))
    } catch (error) {
      console.error('Error processing CSV data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReport = async (formData: ReportFormData) => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit report')
      }

      // Refresh reports
      await fetchReports()
    } catch (error) {
      throw error
    }
  }

  const applyFilters = () => {
    let filtered = data.filter(item => 
      filters.riskLevels.includes(item.risk) &&
      filters.areas.includes(item.locationText.split(',')[0].trim())
    )
    
    // Apply date filter if both dates are set
    if (filters.dateRange[0] && filters.dateRange[1]) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date)
        return itemDate >= filters.dateRange[0] && itemDate <= filters.dateRange[1]
      })
    }
    
    setFilteredData(filtered)
  }

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowLanding(true)}
                className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                title="Back to Home"
              >
                <HomeIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="main-title">City Hygiene Risk Monitor</h1>
                <p className="subtitle">Visualizing Civic Hygiene Risks Across the City</p>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden bg-primary text-white p-2 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="divider" />

      <div className="container mx-auto px-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <Sidebar 
            filters={filters}
            setFilters={setFilters}
            onApplyFilters={applyFilters}
            onDataUpload={handleDataUpload}
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Main Content */}
          <main className="flex-1">
            {data.length === 0 && !loading ? (
              <div className="text-center py-20">
                <Upload className="mx-auto h-16 w-16 text-muted mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  No Reports Yet
                </h2>
                <p className="text-muted mb-6">
                  Start by submitting a hygiene report or uploading CSV data
                </p>
                <button
                  onClick={() => setIsReportFormOpen(true)}
                  className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                >
                  <Plus className="inline h-5 w-5 mr-2" />
                  Submit First Report
                </button>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <SummaryCards data={filteredData} />

                <div className="divider" />

                {/* Map */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      City Hygiene Risk Map
                    </h3>
                    <button
                      onClick={() => setIsReportFormOpen(true)}
                      className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Report
                    </button>
                  </div>
                  <RiskMap data={filteredData} />
                </div>

                <div className="divider" />

                {/* Charts */}
                <Charts data={filteredData} />

                <div className="divider" />

                {/* Data Table */}
                <div className="card">
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Recent Reports
                  </h3>
                  <DataTable data={filteredData} />
                </div>

                {/* Footer */}
                <div className="text-center py-8 text-muted">
                  Made for cleaner cities | Contact
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setIsReportFormOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden bg-primary text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-colors z-40"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Report Form Modal */}
      <ReportForm
        isOpen={isReportFormOpen}
        onClose={() => setIsReportFormOpen(false)}
        onSubmit={handleSubmitReport}
      />
    </div>
  )
} 