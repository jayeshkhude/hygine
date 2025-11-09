'use client'

import { useState } from 'react'
import { X, MapPin, Camera, AlertCircle } from 'lucide-react'
import { ReportFormData, ReportCategory } from '../types'
import { getCategoryIcon, getCategoryLabel, RISK_CONFIGS } from '../utils/riskCalculation'

interface ReportFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ReportFormData) => Promise<void>
}

export function ReportForm({ isOpen, onClose, onSubmit }: ReportFormProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    locationText: '',
    category: 'garbage',
    photoUrl: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isGeocoding, setIsGeocoding] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    let dataToSubmit = { ...formData }

    // Geocode the location if coordinates are not provided
    if (!formData.lat || !formData.lng) {
      setIsGeocoding(true)
      try {
        const response = await fetch('/api/geocode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ locationText: formData.locationText }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Could not find location. Please provide a more specific address.')
        }

        const geocoded = await response.json()
        dataToSubmit = {
          ...formData,
          lat: geocoded.lat,
          lng: geocoded.lng
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to geocode location')
        setIsGeocoding(false)
        return
      } finally {
        setIsGeocoding(false)
      }
    }

    setIsSubmitting(true)
    try {
      await onSubmit(dataToSubmit)
      setFormData({ locationText: '', category: 'garbage', photoUrl: '' })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCategorySelect = (category: ReportCategory) => {
    setFormData(prev => ({ ...prev, category }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Report Hygiene Issue</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Issue Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(RISK_CONFIGS).map(([category, config]) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategorySelect(category as ReportCategory)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.category === category
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{getCategoryIcon(category as ReportCategory)}</div>
                  <div className="text-xs font-medium">{getCategoryLabel(category as ReportCategory)}</div>
                  <div className={`text-xs mt-1 ${
                    formData.category === category ? 'text-white' : 'text-gray-500'
                  }`}>
                    {config.risk.toUpperCase()} Risk • {config.score}/10
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Description
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.locationText}
                onChange={(e) => setFormData(prev => ({ ...prev, locationText: e.target.value }))}
                placeholder="e.g., Central Park near fountain, Broadway Street corner"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Photo Upload (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
              <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {formData.photoUrl ? 'Photo uploaded' : 'Click to upload photo'}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // In production, upload to Cloudinary/Supabase Storage
                    // For demo, we'll just store the filename
                    setFormData(prev => ({ ...prev, photoUrl: file.name }))
                  }
                }}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <span className="text-primary hover:text-primary-dark text-sm font-medium">
                  Choose file
                </span>
              </label>
            </div>
          </div>

          {/* Risk Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Risk Assessment</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Category: <span className="font-medium">{getCategoryLabel(formData.category)}</span></p>
              <p>Risk Level: <span className="font-medium">{RISK_CONFIGS[formData.category].risk.toUpperCase()}</span></p>
              <p>Risk Score: <span className="font-medium">{RISK_CONFIGS[formData.category].score}/10</span></p>
              <p>Expires in: <span className="font-medium">{RISK_CONFIGS[formData.category].expiryDays} days</span></p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isGeocoding || !formData.locationText}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeocoding ? 'Finding location...' : isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  )
} 