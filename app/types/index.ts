export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'citizen'
  createdAt: string
}

export interface Report {
  id: string
  userId: string
  createdAt: string
  date: string // YYYY-MM-DD format
  description: string // What's at this location (e.g., "garbage", "pothole", "road damage")
  lat: number // Required - selected from map
  lng: number // Required - selected from map
  category: ReportCategory
  expiresAt: string
  photoUrl?: string
  status: 'active' | 'expired'
}

export type ReportCategory = 
  | 'garbage'
  | 'pothole'
  | 'road_damage'
  | 'sewage_overflow'
  | 'air_pollution'
  | 'water_pollution'
  | 'noise_pollution'
  | 'other'

export interface ReportFormData {
  description: string
  lat: number
  lng: number
  category: ReportCategory
  photoUrl?: string
}

export interface AdminAudit {
  id: string
  action: 'create' | 'edit' | 'delete' | 'bulk_upload'
  reportId?: string
  userId: string
  timestamp: string
  details: string
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface ReportFilters {
  fromDate?: string
  toDate?: string
  category?: ReportCategory
  bbox?: MapBounds
}

export interface DashboardStats {
  totalReports: number
  categoryBreakdown: Record<ReportCategory, number>
  dailyTrend: Array<{ date: string; count: number }>
} 