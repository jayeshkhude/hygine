'use client'

import { useState } from 'react'
import { Filter, Upload, Info, X } from 'lucide-react'
import { CSVReader } from './CSVReader'

interface Filters {
  riskLevels: string[]
  dateRange: [Date, Date]
  areas: string[]
}

interface SidebarProps {
  filters: Filters
  setFilters: (filters: Filters) => void
  onApplyFilters: () => void
  onDataUpload: (data: any[]) => void
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ filters, setFilters, onApplyFilters, onDataUpload, isOpen, onToggle }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleRiskLevelChange = (level: string, checked: boolean) => {
    if (checked) {
      setFilters({
        ...filters,
        riskLevels: [...filters.riskLevels, level]
      })
    } else {
      setFilters({
        ...filters,
        riskLevels: filters.riskLevels.filter(l => l !== level)
      })
    }
  }

  const handleAreaChange = (area: string, checked: boolean) => {
    if (checked) {
      setFilters({
        ...filters,
        areas: [...filters.areas, area]
      })
    } else {
      setFilters({
        ...filters,
        areas: filters.areas.filter(a => a !== area)
      })
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-secondary border-r border-border transition-all duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="text-lg font-semibold text-foreground">Filters & Tools</h2>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -right-3 top-6 bg-primary text-white p-1 rounded-full shadow-lg lg:block hidden"
          >
            <Filter className="h-4 w-4" />
          </button>

          {/* CSV Upload */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Civic Complaints
            </h3>
            <CSVReader onDataUpload={onDataUpload} />
          </div>

          {/* About Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Info className="h-5 w-5" />
              About
            </h3>
            <div className="text-sm text-muted space-y-2">
              <p>Welcome to the <strong>City Hygiene Risk Monitor</strong>.</p>
              <p>This tool helps you:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Visualize public hygiene risk using civic complaint data</li>
                <li>Map, filter, and analyze city cleanliness hotspots</li>
                <li>Identify areas needing urgent attention</li>
                <li>Track hygiene risk trends over time</li>
              </ul>
              <div className="mt-3 p-3 bg-white rounded-lg border border-border">
                <p className="font-semibold text-foreground mb-1">Risk levels:</p>
                <p className="text-xs">Low, Medium, High</p>
                <p className="font-semibold text-foreground mb-1 mt-2">Data columns:</p>
                <p className="text-xs">text, location, date</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Filters</h3>
            
            {/* Risk Level Filter */}
            <div className="mb-6">
              <h4 className="font-medium text-foreground mb-3">Risk Level</h4>
              <div className="space-y-2">
                {['low', 'medium', 'high'].map(level => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.riskLevels.includes(level)}
                      onChange={(e) => handleRiskLevelChange(level, e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Area Filter */}
            {filters.areas.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-foreground mb-3">Area</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filters.areas.map(area => (
                    <label key={area} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.areas.includes(area)}
                        onChange={(e) => handleAreaChange(area, e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Filters Button */}
            <button
              onClick={onApplyFilters}
              className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </aside>
    </>
  )
} 