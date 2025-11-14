'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Home as HomeIcon, MapPin, Shield } from 'lucide-react'
import { PollutionMap } from '@/app/components/RiskMap'
import { SummaryCards } from '@/app/components/SummaryCards'
import { Charts } from '@/app/components/Charts'
import { DataTable } from '@/app/components/DataTable'
import { Report } from '@/app/types'

const ADMIN_PASSWORD = 'pollution'

export default function AdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [data, setData] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const auth = typeof window !== 'undefined' ? localStorage.getItem('admin_auth') : null
    if (auth === 'ok') {
      setAuthorized(true)
    } else {
      const pwd = window.prompt('Enter admin password')
      if (pwd === ADMIN_PASSWORD) {
        localStorage.setItem('admin_auth', 'ok')
        setAuthorized(true)
      } else {
        router.replace('/')
      }
    }
  }, [router])

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/reports`)
        if (res.ok) {
          const json = await res.json()
          setData(json.reports || [])
        }
      } finally {
        setLoading(false)
      }
    }
    if (authorized) fetchReports()
  }, [authorized])

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                title="Back to Home"
              >
                <HomeIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="main-title flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" /> Admin Dashboard
                </h1>
                <p className="subtitle">Viewing citizen reports (last 7 days)</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="divider" />

      <div className="container mx-auto px-6">
        <main className="flex-1">
          <div className="card mb-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                City Pollution Map
              </h3>
            </div>
            <PollutionMap data={data} />
          </div>

          {data.length === 0 && !loading ? (
            <div className="text-center py-12 text-muted">
              No reports found
              <div className="mt-2 text-xs">If you expect existing data, ensure <span className="font-mono">UPSTASH_REDIS_REST_URL</span> and <span className="font-mono">UPSTASH_REDIS_REST_TOKEN</span> are configured.</div>
            </div>
          ) : (
            <>
              <SummaryCards data={data} />

              <div className="divider" />

              <Charts data={data} />

              <div className="divider" />

              <div className="card">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recent Reports
                </h3>
                <DataTable data={data} />
              </div>

              <div className="divider" />

              <div className="card overflow-x-auto">
                <h3 className="text-xl font-semibold text-foreground mb-4">All Fields</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">User ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Description</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Created At</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Lat</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Lng</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Expires At</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Photo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r) => (
                      <tr key={r.id} className="border-b border-border">
                        <td className="py-3 px-4 font-mono text-muted">{r.id}</td>
                        <td className="py-3 px-4 font-mono text-muted">{r.userId}</td>
                        <td className="py-3 px-4 text-foreground">{r.description}</td>
                        <td className="py-3 px-4 text-foreground">{r.category}</td>
                        <td className="py-3 px-4 text-muted">{new Date(r.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-muted">{new Date(r.createdAt).toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-muted">{r.lat.toFixed(4)}</td>
                        <td className="py-3 px-4 font-mono text-muted">{r.lng.toFixed(4)}</td>
                        <td className="py-3 px-4 text-foreground">{r.status}</td>
                        <td className="py-3 px-4 text-muted">{new Date(r.expiresAt).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          {r.photoUrl ? (
                            <a href={r.photoUrl} target="_blank" rel="noreferrer" className="text-primary underline">View</a>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}