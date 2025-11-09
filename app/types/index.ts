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
  locationText: string
  lat?: number
  lng?: number
  category: ReportCategory
  risk: RiskLevel
  riskScore: number
  expiresAt: string
  photoUrl?: string
  status: 'active' | 'expired'
}

export type ReportCategory = 
  | 'garbage'
  | 'dead_animal'
  | 'sewage_overflow'
  | 'toilet_unclean'
  | 'mosquito_breeding'
  | 'festival_waste'
  | 'general_dirty'

export type RiskLevel = 'low' | 'medium' | 'high'

export interface ReportFormData {
  locationText: string
  lat?: number
  lng?: number
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
  risk?: RiskLevel
  bbox?: MapBounds
}

export interface DashboardStats {
  totalReports: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  categoryBreakdown: Record<ReportCategory, number>
  dailyTrend: Array<{ date: string; count: number }>
} 