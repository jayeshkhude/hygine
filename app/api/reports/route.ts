import { NextRequest, NextResponse } from 'next/server'
import { ReportStore } from '@/app/lib/redis'
import { calculateRisk, calculateExpiryDate } from '@/app/utils/riskCalculation'
import { ReportFormData, ReportCategory } from '@/app/types'
import { geocodeLocation } from '@/app/utils/geocoding'

// Rate limiting middleware
function checkRateLimit(ip: string): boolean {
  // Simple in-memory rate limiting (in production, use Redis)
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 5
  
  // This is a simplified version - in production use Redis for distributed rate limiting
  return true // Placeholder
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body: ReportFormData = await request.json()
    
    // Validation
    if (!body.locationText || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: locationText and category' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories: ReportCategory[] = [
      'garbage', 'dead_animal', 'sewage_overflow', 'toilet_unclean',
      'mosquito_breeding', 'festival_waste', 'general_dirty'
    ]
    
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Validate coordinates if provided
    if (body.lat !== undefined && (body.lat < -90 || body.lat > 90)) {
      return NextResponse.json(
        { error: 'Invalid latitude' },
        { status: 400 }
      )
    }
    
    if (body.lng !== undefined && (body.lng < -180 || body.lng > 180)) {
      return NextResponse.json(
        { error: 'Invalid longitude' },
        { status: 400 }
      )
    }

    // For demo purposes, use a mock user ID
    // In production, this would come from authentication
    const mockUserId = `user_${ip}_${Date.now()}`

    // Check daily limit
    const canSubmit = await ReportStore.canUserSubmitToday(mockUserId)
    if (!canSubmit) {
      return NextResponse.json(
        { error: 'You have already submitted a report today. Please try again tomorrow.' },
        { status: 429 }
      )
    }

    // Geocode location if coordinates are not provided
    let lat = body.lat
    let lng = body.lng
    
    if (lat === undefined || lng === undefined) {
      const geocoded = await geocodeLocation(body.locationText)
      if (geocoded) {
        lat = geocoded.lat
        lng = geocoded.lng
      } else {
        // If geocoding fails, return an error
        return NextResponse.json(
          { error: 'Could not determine location coordinates. Please provide a more specific address or use the map to select a location.' },
          { status: 400 }
        )
      }
    }

    // Calculate risk and expiry
    const riskConfig = calculateRisk(body.category)
    const createdAt = new Date().toISOString()
    const expiresAt = calculateExpiryDate(createdAt, body.category)

    // Create report
    const report = await ReportStore.createReport({
      userId: mockUserId,
      locationText: body.locationText,
      lat: lat,
      lng: lng,
      category: body.category,
      risk: riskConfig.risk,
      riskScore: riskConfig.score,
      photoUrl: body.photoUrl
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get date range (default to last 7 days)
    const toDate = searchParams.get('to') || new Date().toISOString().split('T')[0]
    const fromDate = searchParams.get('from') || 
      new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
    
    // Get filters
    const category = searchParams.get('category')
    const risk = searchParams.get('risk')
    
    // Get reports
    let reports = await ReportStore.getReports(fromDate, toDate)
    
    // Apply filters
    if (category) {
      reports = reports.filter(r => r.category === category)
    }
    
    if (risk) {
      reports = reports.filter(r => r.risk === risk)
    }
    
    // Apply bounding box filter if provided
    const bbox = searchParams.get('bbox')
    if (bbox) {
      try {
        const [west, south, east, north] = bbox.split(',').map(Number)
        reports = reports.filter(r => 
          r.lat !== undefined && r.lng !== undefined &&
          r.lat >= south && r.lat <= north &&
          r.lng >= west && r.lng <= east
        )
      } catch (error) {
        console.warn('Invalid bbox parameter:', bbox)
      }
    }
    
    return NextResponse.json({
      reports,
      total: reports.length,
      fromDate,
      toDate
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 