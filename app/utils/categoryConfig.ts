import { ReportCategory } from '../types'

export interface CategoryConfig {
  expiryDays: number
  mapStyle: {
    color: string
    size: number
  }
}

export const CATEGORY_CONFIGS: Record<ReportCategory, CategoryConfig> = {
  garbage: {
    expiryDays: 7,
    mapStyle: {
      color: '#F97316', // Orange
      size: 18
    }
  },
  pothole: {
    expiryDays: 14,
    mapStyle: {
      color: '#EF4444', // Red
      size: 20
    }
  },
  road_damage: {
    expiryDays: 14,
    mapStyle: {
      color: '#DC2626', // Dark Red
      size: 22
    }
  },
  sewage_overflow: {
    expiryDays: 3,
    mapStyle: {
      color: '#7C3AED', // Purple
      size: 20
    }
  },
  air_pollution: {
    expiryDays: 5,
    mapStyle: {
      color: '#F59E0B', // Yellow
      size: 18
    }
  },
  water_pollution: {
    expiryDays: 5,
    mapStyle: {
      color: '#06B6D4', // Cyan
      size: 18
    }
  },
  noise_pollution: {
    expiryDays: 7,
    mapStyle: {
      color: '#8B5CF6', // Indigo
      size: 16
    }
  },
  other: {
    expiryDays: 7,
    mapStyle: {
      color: '#6B7280', // Gray
      size: 16
    }
  }
}

export function calculateExpiryDate(createdAt: string, category: ReportCategory): string {
  const config = CATEGORY_CONFIGS[category]
  const createdDate = new Date(createdAt)
  const expiryDate = new Date(createdDate.getTime() + (config.expiryDays * 24 * 60 * 60 * 1000))
  return expiryDate.toISOString()
}

export function isReportExpired(report: { expiresAt: string }): boolean {
  return new Date() > new Date(report.expiresAt)
}

export function getCategoryIcon(category: ReportCategory): string {
  const icons: Record<ReportCategory, string> = {
    garbage: '🗑️',
    pothole: '🕳️',
    road_damage: '🛣️',
    sewage_overflow: '💧',
    air_pollution: '💨',
    water_pollution: '🌊',
    noise_pollution: '🔊',
    other: '📍'
  }
  return icons[category]
}

export function getCategoryLabel(category: ReportCategory): string {
  const labels: Record<ReportCategory, string> = {
    garbage: 'Garbage',
    pothole: 'Pothole',
    road_damage: 'Road Damage',
    sewage_overflow: 'Sewage Overflow',
    air_pollution: 'Air Pollution',
    water_pollution: 'Water Pollution',
    noise_pollution: 'Noise Pollution',
    other: 'Other'
  }
  return labels[category]
}

