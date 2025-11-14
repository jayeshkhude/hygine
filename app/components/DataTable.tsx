'use client'

import { useState } from 'react'
import { Report } from '../types'
import { getCategoryIcon, getCategoryLabel } from '../utils/categoryConfig'

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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-gray-50" onClick={() => handleSort('date')}>
              Date
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-gray-50" onClick={() => handleSort('description')}>
              Description
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-gray-50" onClick={() => handleSort('category')}>
              Category
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground cursor-pointer hover:bg-gray-50" onClick={() => handleSort('createdAt')}>
              Reported
            </th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Location</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr key={item.id} className="border-b border-border hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 text-sm text-foreground">
                {new Date(item.date).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-sm text-foreground">
                <div className="max-w-xs truncate" title={item.description}>
                  {item.description}
                </div>
              </td>
              <td className="py-3 px-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(item.category)}</span>
                  <span className="text-foreground">{getCategoryLabel(item.category)}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-muted">
                {new Date(item.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-sm text-muted font-mono">
                {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {sortedData.length === 0 && (
        <div className="text-center py-8 text-muted">
          No reports found
        </div>
      )}
    </div>
  )
}
