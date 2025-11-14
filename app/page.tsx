'use client'

import { useState, useEffect } from 'react'
import { Upload, MapPin, AlertTriangle, Calendar, BarChart3, Home as HomeIcon, Shield } from 'lucide-react'
import { PollutionMap } from './components/RiskMap'
import { SummaryCards } from './components/SummaryCards'
import { Charts } from './components/Charts'
import { DataTable } from './components/DataTable'
import { ReportForm } from './components/ReportForm'
import { LandingPage } from './components/LandingPage'
import { Report, ReportFormData } from './types'


export default function Home() {
  const [showLanding, setShowLanding] = useState(true)
  const [data, setData] = useState<Report[]>([])
  const [filteredData, setFilteredData] = useState<Report[]>([])
  const [isReportFormOpen, setIsReportFormOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)

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
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle map click to select location
  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng })
    setIsReportFormOpen(true)
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
                <h1 className="main-title">City Pollution Monitor</h1>
                <p className="subtitle">Report and Track Pollution Issues Across the City</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                const pwd = window.prompt('Enter admin password')
                if (pwd === 'pollution') {
                  localStorage.setItem('admin_auth', 'ok')
                  window.location.href = '/admin'
                } else if (pwd) {
                  alert('Incorrect password')
                }
              }}
              className="border-2 border-primary text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors flex items-center gap-2"
              title="Admin"
            >
              <Shield className="h-4 w-4" /> Admin
            </button>
          </div>
        </div>
      </header>

      <div className="divider" />

      <div className="container mx-auto px-6">
        <main className="flex-1">
          {/* Map - Always visible */}
          <div className="card mb-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                City Pollution Map
              </h3>
            </div>
            <PollutionMap 
              data={filteredData} 
              onMapClick={handleMapClick}
              selectedLocation={selectedLocation}
            />
          </div>

          {data.length === 0 && !loading ? (
            <div className="text-center py-12">
              <Upload className="mx-auto h-16 w-16 text-muted mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                No Reports Yet
              </h2>
              <p className="text-muted mb-6">
                Click on the map above to select a location and report pollution issues
              </p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <SummaryCards data={filteredData} />

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

      {/* Report Form Modal */}
      <ReportForm
        isOpen={isReportFormOpen}
        onClose={() => {
          setIsReportFormOpen(false)
          setSelectedLocation(null)
        }}
        onSubmit={handleSubmitReport}
        selectedLocation={selectedLocation}
      />
    </div>
  )
}