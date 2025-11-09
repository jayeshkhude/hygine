/**
 * Enhanced Geocoding utility using OpenStreetMap Nominatim API
 * Free, no API key required, but has rate limiting (1 request per second)
 * Includes retry logic and multiple query formats for better accuracy
 */

export interface GeocodeResult {
  lat: number
  lng: number
  displayName: string
  confidence?: number
}

/**
 * Generate multiple query variations for better geocoding accuracy
 */
function generateQueryVariations(locationText: string): string[] {
  const trimmed = locationText.trim()
  const variations: string[] = [trimmed]
  
  // Add variations with different formats
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(p => p.trim())
    // Original
    variations.push(trimmed)
    // Reversed (city, country -> country, city)
    if (parts.length === 2) {
      variations.push(`${parts[1]}, ${parts[0]}`)
    }
    // Just the first part (city name)
    variations.push(parts[0])
    // Just the last part (country/state)
    if (parts.length > 1) {
      variations.push(parts[parts.length - 1])
    }
  } else {
    // If no comma, try adding common suffixes
    variations.push(`${trimmed}, India`)
    variations.push(`${trimmed}, USA`)
  }
  
  // Remove duplicates and return
  return Array.from(new Set(variations))
}

/**
 * Geocode a location string to coordinates with retry logic
 * @param locationText - Location description (e.g., "Pune, India" or "Central Park, NYC")
 * @param retries - Number of retry attempts with different query formats
 * @returns Promise with coordinates or null if geocoding fails
 */
export async function geocodeLocation(
  locationText: string,
  retries: number = 3
): Promise<GeocodeResult | null> {
  if (!locationText || locationText.trim().length === 0) {
    return null
  }

  const queryVariations = generateQueryVariations(locationText)
  
  // Try each variation
  for (const query of queryVariations) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const encodedLocation = encodeURIComponent(query)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=5&addressdetails=1&extratags=1`

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'CityHygieneRiskMonitor/1.0',
            'Accept-Language': 'en'
          }
        })

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited - wait longer
            await new Promise(resolve => setTimeout(resolve, 2000))
            continue
          }
          continue
        }

        const data = await response.json()

        if (!data || data.length === 0) {
          continue
        }

        // Find the best match (prefer exact matches, then most relevant)
        let bestMatch = data[0]
        
        // Score results by relevance
        for (const result of data) {
          const importance = result.importance || 0
          const matchScore = result.importance || 0
          
          // Prefer results with higher importance and better match
          if (matchScore > (bestMatch.importance || 0)) {
            bestMatch = result
          }
          
          // If we find an exact match in display_name, use it
          if (result.display_name?.toLowerCase().includes(locationText.toLowerCase().split(',')[0].toLowerCase())) {
            bestMatch = result
            break
          }
        }

        // Validate coordinates
        const lat = parseFloat(bestMatch.lat)
        const lng = parseFloat(bestMatch.lon)
        
        if (isNaN(lat)) return null
        if (isNaN(lng)) return null
        if (lat < -90 || lat > 90) return null
        if (lng < -180 || lng > 180) return null

        return {
          lat,
          lng,
          displayName: bestMatch.display_name || locationText,
          confidence: bestMatch.importance || 0.5
        }
      } catch (error) {
        console.warn(`Geocoding attempt ${attempt + 1} failed for "${query}":`, error)
        // Wait before retry
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        }
      }
    }
  }

  console.warn('All geocoding attempts failed for:', locationText)
  return null
}

/**
 * Geocode multiple locations with rate limiting
 * @param locations - Array of location strings
 * @param delayMs - Delay between requests in milliseconds (default 1100ms to respect 1 req/sec limit)
 * @returns Promise with array of geocode results (null for failed geocoding)
 */
export async function geocodeLocations(
  locations: string[],
  delayMs: number = 1100
): Promise<(GeocodeResult | null)[]> {
  const results: (GeocodeResult | null)[] = []

  for (let i = 0; i < locations.length; i++) {
    const result = await geocodeLocation(locations[i])
    results.push(result)

    // Rate limiting: wait between requests (except for the last one)
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return results
}

/**
 * Batch geocode with error handling
 * Skips locations that fail to geocode
 */
export async function batchGeocode(locations: string[]): Promise<Map<string, GeocodeResult>> {
  const results = new Map<string, GeocodeResult>()
  
  for (const location of locations) {
    const geocoded = await geocodeLocation(location)
    if (geocoded) {
      results.set(location, geocoded)
    }
    // Wait 1.1 seconds between requests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1100))
  }
  
  return results
}

