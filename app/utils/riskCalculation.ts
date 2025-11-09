import { ReportCategory, RiskLevel } from '../types'

export interface RiskConfig {
  risk: RiskLevel
  score: number
  expiryDays: number
  mapStyle: {
    color: string
    size: number
    pulse?: boolean
    glow?: boolean
  }
}

export const RISK_CONFIGS: Record<ReportCategory, RiskConfig> = {
  dead_animal: {
    risk: 'high',
    score: 10,
    expiryDays: 1,
    mapStyle: {
      color: '#EF4444', // Red
      size: 24,
      pulse: true
    }
  },
  sewage_overflow: {
    risk: 'high',
    score: 9,
    expiryDays: 2,
    mapStyle: {
      color: '#EF4444', // Red
      size: 22,
      pulse: true
    }
  },
  mosquito_breeding: {
    risk: 'medium',
    score: 8,
    expiryDays: 3,
    mapStyle: {
      color: '#F97316', // Orange
      size: 20,
      glow: true
    }
  },
  garbage: {
    risk: 'medium',
    score: 7,
    expiryDays: 5,
    mapStyle: {
      color: '#F97316', // Orange
      size: 18
    }
  },
  toilet_unclean: {
    risk: 'low',
    score: 5,
    expiryDays: 7,
    mapStyle: {
      color: '#F59E0B', // Yellow
      size: 16
    }
  },
  festival_waste: {
    risk: 'low',
    score: 4,
    expiryDays: 7,
    mapStyle: {
      color: '#F59E0B', // Yellow
      size: 14
    }
  },
  general_dirty: {
    risk: 'low',
    score: 3,
    expiryDays: 7,
    mapStyle: {
      color: '#10B981', // Green
      size: 12
    }
  }
}

export function calculateRisk(category: ReportCategory): RiskConfig {
  return RISK_CONFIGS[category]
}

export function calculateExpiryDate(createdAt: string, category: ReportCategory): string {
  const config = RISK_CONFIGS[category]
  const createdDate = new Date(createdAt)
  const expiryDate = new Date(createdDate.getTime() + (config.expiryDays * 24 * 60 * 60 * 1000))
  
  // Enforce maximum 7-day limit
  const maxExpiry = new Date(createdDate.getTime() + (7 * 24 * 60 * 60 * 1000))
  
  return new Date(Math.min(expiryDate.getTime(), maxExpiry.getTime())).toISOString()
}

export function isReportExpired(report: { expiresAt: string }): boolean {
  return new Date() > new Date(report.expiresAt)
}

export function getCategoryIcon(category: ReportCategory): string {
  const icons: Record<ReportCategory, string> = {
    garbage: '🗑️',
    dead_animal: '💀',
    sewage_overflow: '💧',
    toilet_unclean: '🚽',
    mosquito_breeding: '🦟',
    festival_waste: '🎉',
    general_dirty: '🧹'
  }
  return icons[category]
}

export function getCategoryLabel(category: ReportCategory): string {
  const labels: Record<ReportCategory, string> = {
    garbage: 'Garbage',
    dead_animal: 'Dead Animal',
    sewage_overflow: 'Sewage Overflow',
    toilet_unclean: 'Toilet Unclean',
    mosquito_breeding: 'Mosquito Breeding',
    festival_waste: 'Festival Waste',
    general_dirty: 'General Dirty'
  }
  return labels[category]
} 