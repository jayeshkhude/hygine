'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Report } from '../types'
import { getCategoryLabel } from '../utils/riskCalculation'

interface ChartsProps {
  data: Report[]
}

export function Charts({ data }: ChartsProps) {
  // Prepare data for category breakdown chart
  const categoryData = Object.entries(
    data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([category, count]) => ({
    category: getCategoryLabel(category as any),
    count,
    originalCategory: category
  }))

  // Prepare data for risk level breakdown
  const riskData = Object.entries(
    data.reduce((acc, item) => {
      acc[item.risk] = (acc[item.risk] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([risk, count]) => ({
    risk: risk.charAt(0).toUpperCase() + risk.slice(1),
    count
  }))

  // Prepare data for daily trend
  const dailyData = Object.entries(
    data.reduce((acc, item) => {
      const date = item.date
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  )
  .map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count
  }))
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658']

  return (
    <div className="space-y-8">
      {/* Category Breakdown */}
      <div className="card">
        <h3 className="text-xl font-semibold text-foreground mb-4">Reports by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#000000" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-xl font-semibold text-foreground mb-4">Risk Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ risk, percent }) => `${risk} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Trend */}
        <div className="card">
          <h3 className="text-xl font-semibold text-foreground mb-4">Daily Report Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#000000" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
} 