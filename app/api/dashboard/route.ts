import { NextResponse } from 'next/server'
import { ReportStore } from '@/app/lib/redis'

export async function GET() {
  try {
    const stats = await ReportStore.getDashboardStats()
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 