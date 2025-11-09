'use client'

import { useState } from 'react'
import { Report } from '../types'
import { getCategoryIcon, getCategoryLabel } from '../utils/riskCalculation'

interface DataTableProps {
  data: Report[]
}

export function DataTable({ data }: DataTableProps) {
  const [sortField, setSortField] = useState<keyof Report>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: keyof Report) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue === bValue) return 0
    
    let comparison = 0
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      // Try to parse as dates first
      const aDate = new Date(aValue)
      const bDate = new Date(bValue)
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        comparison = aDate.getTime() - bDate.getTime()
      } else {
        comparison = aValue.localeCompare(bValue)
      }
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-orange-100 text-orange-800'
      case 'low': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-gray-50" onClick={() => handleSort('category')}>
              Category
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-gray-50" onClick={() => handleSort('locationText')}>
              Location
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-gray-50" onClick={() => handleSort('risk')}>
              Risk Level
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-gray-50" onClick={() => handleSort('riskScore')}>
              Score
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-gray-50" onClick={() => handleSort('date')}>
              Date
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-gray-50" onClick={() => handleSort('expiresAt')}>
              Expires
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr key={item.id} className="border-b border-border hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(item.category)}</span>
                  <span className="text-sm font-medium">{getCategoryLabel(item.category)}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="max-w-xs truncate" title={item.locationText}>
                  {item.locationText}
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(item.risk)}`}>
                  {item.risk.toUpperCase()}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="font-mono text-sm">{item.riskScore}/10</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-muted">
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-muted">
                  {new Date(item.expiresAt).toLocaleDateString()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {sortedData.length === 0 && (
        <div className="text-center py-8 text-muted">
          No reports to display
        </div>
      )}
    </div>
  )
} 