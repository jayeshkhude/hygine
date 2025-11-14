'use client'

import { AlertTriangle, TrendingUp, Calendar, MapPin } from 'lucide-react'
import { Report } from '../types'

interface SummaryCardsProps {
  data: Report[]
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const totalReports = data.length
  
  // Get category counts
  const categoryCounts = data.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Get latest report date
  const latestReport = data.length > 0 
    ? new Date(Math.max(...data.map(item => new Date(item.createdAt).getTime())))
    : null

  // Get top categories
  const topCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  const cards = [
    {
      title: 'Total Reports',
      value: totalReports,
      icon: <MapPin className="h-6 w-6" />,
      color: 'bg-blue-500',
      description: 'Active pollution reports'
    },
    ...topCategories.map(([category, count], index) => ({
      title: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
      value: count,
      icon: <AlertTriangle className="h-6 w-6" />,
      color: index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500',
      description: 'Reports in this category'
    }))
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between mb-4">
            <div className={`${card.color} text-white p-3 rounded-lg`}>
              {card.icon}
            </div>
            <div className="text-right">
              <p className="summary-title">{card.title}</p>
              <p className="summary-value">{card.value}</p>
            </div>
          </div>
          <p className="text-sm text-muted">{card.description}</p>
        </div>
      ))}
      
      {/* Latest Report Info */}
      {latestReport && (
        <div className="card col-span-full lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 text-white p-3 rounded-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Latest Activity</h3>
              <p className="text-muted">
                Most recent report: {latestReport.toLocaleDateString()} at {latestReport.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 