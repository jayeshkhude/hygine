'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Report } from '../types'
import { RISK_CONFIGS, getCategoryIcon, getCategoryLabel } from '../utils/riskCalculation'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface RiskMapProps {
  data: Report[]
}

export function RiskMap({ data }: RiskMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-muted">Loading map...</p>
      </div>
    )
  }

  // Filter out items without valid coordinates
  const validData = data.filter(item => 
    item.lat !== undefined && item.lng !== undefined &&
    !isNaN(item.lat) && !isNaN(item.lng) &&
    item.lat >= -90 && item.lat <= 90 &&
    item.lng >= -180 && item.lng <= 180
  )

  if (validData.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-muted">No valid location data to display on map</p>
      </div>
    )
  }

  // Calculate center from actual coordinates
  const center = {
    lat: validData.reduce((sum, item) => sum + (item.lat || 0), 0) / validData.length,
    lng: validData.reduce((sum, item) => sum + (item.lng || 0), 0) / validData.length
  }

  // Group data by risk level for better visual hierarchy
  const groupedData = {
    high: validData.filter(item => item.risk === 'high'),
    medium: validData.filter(item => item.risk === 'medium'),
    low: validData.filter(item => item.risk === 'low')
  }
  
  // Calculate appropriate zoom level based on data spread
  const calculateZoom = () => {
    if (validData.length === 0) return 12
    if (validData.length === 1) return 15
    
    const lats = validData.map(item => item.lat!).filter(lat => lat !== undefined)
    const lngs = validData.map(item => item.lng!).filter(lng => lng !== undefined)
    
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
  }

  return (
    <div className="h-96 w-full relative">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={calculateZoom()}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Render markers by risk level for better visual hierarchy */}
        {Object.entries(groupedData).map(([riskLevel, items]) => (
          items.map((item, index) => {
            const config = RISK_CONFIGS[item.category]
            const isHighRisk = config.mapStyle.pulse === true
            const hasGlow = config.mapStyle.glow === true
            
            return (
              <CircleMarker
                key={`${riskLevel}-${item.id || index}`}
                center={[item.lat!, item.lng!]}
                radius={config.mapStyle.size}
                pathOptions={{
                  fillColor: config.mapStyle.color,
                  color: '#ffffff',
                  weight: hasGlow ? 3 : 2,
                  opacity: 0.8,
                  fillOpacity: 0.7,
                }}
                className={`cursor-pointer hover:opacity-100 transition-opacity ${
                  isHighRisk ? 'animate-pulse' : ''
                } ${hasGlow ? 'shadow-lg' : ''}`}
              >
                <Popup>
                  <div className="p-3 min-w-48">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getCategoryIcon(item.category)}</span>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold text-white ${
                        item.risk === 'high' ? 'bg-red-600' :
                        item.risk === 'medium' ? 'bg-orange-600' :
                        'bg-yellow-600'
                      }`}>
                        {item.risk.toUpperCase()} Risk
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-gray-800 mb-1">
                      {getCategoryLabel(item.category)}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">{item.locationText}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>
                        <span className="font-medium">Date:</span> {new Date(item.date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Risk Score:</span> {item.riskScore}/10
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
          })
        ))}
      </MapContainer>

      {/* Enhanced Legend */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-[1000] max-w-48">
        <h4 className="font-semibold text-sm text-gray-800 mb-3">Risk Level Legend</h4>
        <div className="space-y-2">
          {Object.entries(RISK_CONFIGS).map(([category, config]) => (
            <div key={category} className="flex items-center gap-2">
              <div 
                className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                  config.mapStyle.pulse === true ? 'animate-pulse' : ''
                }`}
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
                  {config.risk.toUpperCase()} • {config.score}/10 • {config.expiryDays}d
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Special Effects Legend */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-2">Special Effects:</div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Pulsing = High Risk</span>
          </div>
          <div className="flex items-center gap-2 text-xs mt-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full shadow-lg"></div>
            <span className="text-gray-600">Glow = Medium Risk</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add Leaflet CSS
if (typeof window !== 'undefined') {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
  link.crossOrigin = ''
  document.head.appendChild(link)
} 