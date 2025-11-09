import { Redis } from '@upstash/redis'
import { Report, ReportCategory, RiskLevel } from '../types'

// Check if Redis environment variables are available
const hasRedisConfig = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

// Initialize Redis client only if environment variables are available
const redis = hasRedisConfig ? new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
}) : null

// In-memory storage fallback
class InMemoryStore {
  private reports = new Map<string, Report>()
  private dailyReports = new Map<string, Set<string>>()
  private userDailyReports = new Map<string, Set<string>>()

  async setex(key: string, ttl: number, value: string): Promise<void> {
    this.reports.set(key, JSON.parse(value))
    // Simple TTL simulation - in production, use proper TTL
    setTimeout(() => this.reports.delete(key), ttl * 1000)
  }

  async get(key: string): Promise<string | null> {
    const value = this.reports.get(key)
    return value ? JSON.stringify(value) : null
  }

  async zadd(key: string, data: { score: number; member: string }): Promise<void> {
    if (!this.dailyReports.has(key)) {
      this.dailyReports.set(key, new Set())
    }
    this.dailyReports.get(key)!.add(data.member)
  }

  async zrange(key: string, start: number, end: number): Promise<string[]> {
    const set = this.dailyReports.get(key)
    if (!set) return []
    return Array.from(set).slice(start, end === -1 ? undefined : end + 1)
  }

  async expire(key: string, ttl: number): Promise<void> {
    // TTL is handled in setex for simplicity
  }

  async exists(key: string): Promise<number> {
    return this.reports.has(key) ? 1 : 0
  }

  async del(key: string): Promise<void> {
    this.reports.delete(key)
  }

  async zrem(key: string, member: string): Promise<void> {
    const set = this.dailyReports.get(key)
    if (set) {
      set.delete(member)
    }
  }
}

// Use in-memory store if Redis is not available
const store = hasRedisConfig && redis ? redis : new InMemoryStore()

export class ReportStore {
  private static readonly REPORT_PREFIX = 'report:'
  private static readonly DAILY_PREFIX = 'reports:'
  private static readonly USER_DAILY_PREFIX = 'user_daily:'
  private static readonly TTL_DAYS = 7

  // Create a new report
  static async createReport(report: Omit<Report, 'id' | 'createdAt' | 'expiresAt' | 'status' | 'date'>): Promise<Report> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    const date = new Date().toISOString().split('T')[0] // Always use current date
    const expiresAt = new Date(Date.now() + (this.TTL_DAYS * 24 * 60 * 60 * 1000)).toISOString()
    
    const fullReport: Report = {
      ...report,
      id,
      createdAt,
      date,
      expiresAt,
      status: 'active'
    }

    // Store report with TTL
    await store.setex(
      `${this.REPORT_PREFIX}${id}`,
      this.TTL_DAYS * 24 * 60 * 60, // 7 days in seconds
      JSON.stringify(fullReport)
    )

    // Add to daily sorted set
    await store.zadd(
      `${this.DAILY_PREFIX}${date}`,
      { score: Date.now(), member: id }
    )
    await store.expire(`${this.DAILY_PREFIX}${date}`, this.TTL_DAYS * 24 * 60 * 60)

    // Track user daily limit
    const userDailyKey = `${this.USER_DAILY_PREFIX}${report.userId}:${date}`
    await store.setex(userDailyKey, 24 * 60 * 60, '1') // 24 hours TTL

    return fullReport
  }

  // Get report by ID
  static async getReport(id: string): Promise<Report | null> {
    const data = await store.get(`${this.REPORT_PREFIX}${id}`)
    if (!data) return null
    
    const report: Report = JSON.parse(data as string)
    if (this.isExpired(report)) {
      await this.deleteReport(id)
      return null
    }
    
    return report
  }

  // Get reports for a specific date range
  static async getReports(fromDate: string, toDate: string): Promise<Report[]> {
    const reports: Report[] = []
    const currentDate = new Date(fromDate)
    const endDate = new Date(toDate)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dailyKey = `${this.DAILY_PREFIX}${dateStr}`
      
      const reportIds = await store.zrange(dailyKey, 0, -1)
      
      for (const id of reportIds) {
        const report = await this.getReport(id as string)
        if (report) {
          reports.push(report)
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // Get all active reports (last 7 days)
  static async getActiveReports(): Promise<Report[]> {
    const endDate = new Date()
    const startDate = new Date(Date.now() - (this.TTL_DAYS * 24 * 60 * 60 * 1000))
    
    return this.getReports(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )
  }

  // Check if user can submit report today
  static async canUserSubmitToday(userId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0]
    const userDailyKey = `${this.USER_DAILY_PREFIX}${userId}:${today}`
    
    const exists = await store.exists(userDailyKey)
    return !exists
  }

  // Delete report
  static async deleteReport(id: string): Promise<boolean> {
    const report = await this.getReport(id)
    if (!report) return false

    // Remove from daily set
    const date = report.date
    await store.zrem(`${this.DAILY_PREFIX}${date}`, id)
    
    // Remove report
    await store.del(`${this.REPORT_PREFIX}${id}`)
    
    return true
  }

  // Update report
  static async updateReport(id: string, updates: Partial<Report>): Promise<Report | null> {
    const existing = await this.getReport(id)
    if (!existing) return null

    const updated: Report = { ...existing, ...updates }
    
    // Recalculate expiry if category changed
    if (updates.category && updates.category !== existing.category) {
      const { calculateExpiryDate } = await import('../utils/riskCalculation')
      updated.expiresAt = calculateExpiryDate(updated.createdAt, updates.category)
    }

    await store.setex(
      `${this.REPORT_PREFIX}${id}`,
      this.TTL_DAYS * 24 * 60 * 60,
      JSON.stringify(updated)
    )

    return updated
  }

  // Get dashboard statistics
  static async getDashboardStats(): Promise<{
    totalReports: number
    highRiskCount: number
    mediumRiskCount: number
    lowRiskCount: number
    categoryBreakdown: Record<ReportCategory, number>
    dailyTrend: Array<{ date: string; count: number }>
  }> {
    const reports = await this.getActiveReports()
    
    const categoryBreakdown: Record<ReportCategory, number> = {
      garbage: 0,
      dead_animal: 0,
      sewage_overflow: 0,
      toilet_unclean: 0,
      mosquito_breeding: 0,
      festival_waste: 0,
      general_dirty: 0
    }

    const dailyCounts: Record<string, number> = {}
    
    reports.forEach(report => {
      categoryBreakdown[report.category]++
      
      const date = report.date
      dailyCounts[date] = (dailyCounts[date] || 0) + 1
    })

    const dailyTrend = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      totalReports: reports.length,
      highRiskCount: reports.filter(r => r.risk === 'high').length,
      mediumRiskCount: reports.filter(r => r.risk === 'medium').length,
      lowRiskCount: reports.filter(r => r.risk === 'low').length,
      categoryBreakdown,
      dailyTrend
    }
  }

  // Cleanup expired reports (called periodically)
  static async cleanupExpiredReports(): Promise<number> {
    const reports = await this.getActiveReports()
    let cleanedCount = 0

    for (const report of reports) {
      if (this.isExpired(report)) {
        await this.deleteReport(report.id)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  private static isExpired(report: Report): boolean {
    return new Date() > new Date(report.expiresAt)
  }
} 