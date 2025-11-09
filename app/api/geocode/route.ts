import { NextRequest, NextResponse } from 'next/server'
import { geocodeLocation } from '@/app/utils/geocoding'

/**
 * API route for geocoding locations
 * This avoids CORS issues and allows us to add rate limiting/caching
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locationText } = body

    if (!locationText || typeof locationText !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid locationText' },
        { status: 400 }
      )
    }

    // Geocode the location
    const result = await geocodeLocation(locationText)

    if (!result) {
      return NextResponse.json(
        { error: 'Could not geocode location. Please try a more specific address.' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Geocoding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error during geocoding' },
      { status: 500 }
    )
  }
}

// Also support GET for simple queries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationText = searchParams.get('q')

    if (!locationText) {
      return NextResponse.json(
        { error: 'Missing location query parameter (q)' },
        { status: 400 }
      )
    }

    const result = await geocodeLocation(locationText)

    if (!result) {
      return NextResponse.json(
        { error: 'Could not geocode location' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Geocoding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error during geocoding' },
      { status: 500 }
    )
  }
}

