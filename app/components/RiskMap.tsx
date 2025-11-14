'use client'

import { useEffect, useState, useMemo, memo } from 'react'
import dynamic from 'next/dynamic'
import { Report } from '../types'
import { CATEGORY_CONFIGS, getCategoryIcon, getCategoryLabel } from '../utils/categoryConfig'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })

interface PollutionMapProps {
  data: Report[]
  onMapClick?: (lat: number, lng: number) => void
  selectedLocation?: { lat: number; lng: number } | null
  onLocationSearch?: (lat: number, lng: number) => void
}

// Map click handler component - must be inside MapContainer
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  // Import useMapEvents dynamically inside the component
  const { useMapEvents } = require('react-leaflet')
  const map = useMapEvents({
    click: (e: any) => {
      const { lat, lng } = e.latlng
      onMapClick(lat, lng)
    },
  })
  return null
}

// Component to update map view when center changes
function MapViewUpdater({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const { useMap } = require('react-leaflet')
  const map = useMap()
  
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom)
  }, [center.lat, center.lng, zoom, map])
  
  return null
}

export const PollutionMap = memo(function PollutionMap({ data, onMapClick, selectedLocation, onLocationSearch }: PollutionMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [mapType, setMapType] = useState<'satellite' | 'street'>('satellite')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
  const streetTileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Memoize filtered data to avoid recalculation
  const validData = useMemo(() => {
    return data.filter(item => 
      item.lat !== undefined && item.lng !== undefined &&
      !isNaN(item.lat) && !isNaN(item.lng) &&
      item.lat >= -90 && item.lat <= 90 &&
      item.lng >= -180 && item.lng <= 180
    )
  }, [data])

  // Memoize center calculation
  const center = useMemo(() => {
    if (validData.length === 0) {
      // Default to a common location if no data
      return { lat: 18.5204, lng: 73.8567 } // Pune, India
    }
    return {
      lat: validData.reduce((sum, item) => sum + item.lat, 0) / validData.length,
      lng: validData.reduce((sum, item) => sum + item.lng, 0) / validData.length
    }
  }, [validData])
  
  // Memoize zoom calculation
  const zoom = useMemo(() => {
    if (validData.length === 0) return 12
    if (validData.length === 1) return 15
    
    const lats = validData.map(item => item.lat!).filter(lat => lat !== undefined)
    const lngs = validData.map(item => item.lng!).filter(lng => lng !== undefined)
    
    if (lats.length === 0 || lngs.length === 0) return 12
    
    const latRange = Math.max(...lats) - Math.min(...lats)
    const lngRange = Math.max(...lngs) - Math.min(...lngs)
    const maxRange = Math.max(latRange, lngRange)
    
    // Rough zoom calculation based on coordinate range
    if (maxRange > 10) return 5
    if (maxRange > 5) return 6
    if (maxRange > 2) return 8
    if (maxRange > 1) return 10
    if (maxRange > 0.5) return 12
    if (maxRange > 0.1) return 13
    return 14
  }, [validData])

  if (!isClient) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-muted">Loading map...</p>
      </div>
    )
  }

  // Handle location search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locationText: searchQuery }),
      })

      if (response.ok) {
        const result = await response.json()
        const newCenter = { lat: result.lat, lng: result.lng }
        setMapCenter(newCenter)
        if (onLocationSearch) {
          onLocationSearch(result.lat, result.lng)
        }
        setSearchQuery('') // Clear search after success
      } else {
        alert('Location not found. Please try a more specific address.')
      }
    } catch (error) {
      console.error('Search error:', error)
      alert('Failed to search location. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  // Show map even if no data - allow clicking to add new reports
  const defaultCenter = mapCenter || (validData.length === 0 
    ? { lat: 18.5204, lng: 73.8567 } // Default to Pune, India
    : center)
  const defaultZoom = validData.length === 0 ? 12 : zoom

  return (
    <div className="h-96 w-full relative">
      {/* Location Search Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-md px-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location (e.g., Pune, India)"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSearching ? 'Searching...' : '🔍 Search'}
          </button>
        </form>
      </div>

      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        key={`map-${mapType}-${mapCenter?.lat}-${mapCenter?.lng}`} // Force re-render when map center changes
      >
        {/* Map Layer - Satellite or Street */}
        {mapType === 'satellite' ? (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
          />
        ) : (
          <TileLayer
            url={streetTileUrl}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        )}
        
        {/* Map click handler */}
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
        
        {/* Map view updater - updates map when center changes */}
        <MapViewUpdater center={defaultCenter} zoom={defaultZoom} />
        
        {/* Selected location marker */}
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>
              <div className="p-2">
                <p className="text-sm font-medium">Selected Location</p>
                <p className="text-xs text-gray-600">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Render pollution markers */}
        {validData.map((item) => {
          const config = CATEGORY_CONFIGS[item.category]
          
          return (
            <CircleMarker
              key={item.id}
              center={[item.lat, item.lng]}
              radius={config.mapStyle.size}
              pathOptions={{
                fillColor: config.mapStyle.color,
                color: '#ffffff',
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.7,
              }}
              className="cursor-pointer hover:opacity-100 transition-opacity"
            >
              <Popup>
                <div className="p-3 min-w-48">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getCategoryIcon(item.category)}</span>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-bold text-white bg-blue-600">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-800 mb-1">
                    {item.description}
                  </h3>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      <span className="font-medium">Date:</span> {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Expires:</span> {new Date(item.expiresAt).toLocaleDateString()}
                    </div>
                    {item.photoUrl && (
                      <div>
                        <span className="font-medium">Photo:</span> Available
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Map Type Switcher */}
      <div className="absolute top-20 left-4 bg-white p-2 rounded-lg shadow-lg border border-gray-200 z-[1000] flex gap-2">
        <button
          onClick={() => setMapType('satellite')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            mapType === 'satellite'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🛰️ Satellite
        </button>
        <button
          onClick={() => setMapType('street')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            mapType === 'street'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🗺️ Street
        </button>
      </div>

      {/* Click instruction */}
      {onMapClick && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-[1000] text-sm font-medium">
          📍 Click on the map to select a location
        </div>
      )}

      {/* Category Legend */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-[1000] max-w-48">
        <h4 className="font-semibold text-sm text-gray-800 mb-3">Pollution Categories</h4>
        <div className="space-y-2">
          {Object.entries(CATEGORY_CONFIGS).map(([category, config]) => (
            <div key={category} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                style={{ 
                  backgroundColor: config.mapStyle.color,
                  width: `${config.mapStyle.size * 0.6}px`,
                  height: `${config.mapStyle.size * 0.6}px`
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-700 font-medium truncate">
                  {getCategoryLabel(category as any)}
                </div>
                <div className="text-xs text-gray-500">
                  Expires in {config.expiryDays} days
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

// Add Leaflet CSS
if (typeof window !== 'undefined') {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
  link.crossOrigin = ''
  document.head.appendChild(link)
}