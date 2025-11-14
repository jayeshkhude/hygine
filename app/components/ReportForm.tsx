'use client'

import { useState, useEffect } from 'react'
import { X, Camera } from 'lucide-react'
import { ReportFormData, ReportCategory } from '../types'
import { getCategoryIcon, getCategoryLabel, CATEGORY_CONFIGS } from '../utils/categoryConfig'

interface ReportFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ReportFormData) => Promise<void>
  selectedLocation: { lat: number; lng: number } | null
}

export function ReportForm({ isOpen, onClose, onSubmit, selectedLocation }: ReportFormProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    description: '',
    lat: 0,
    lng: 0,
    category: 'garbage',
    photoUrl: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Update coordinates when location is selected from map
  useEffect(() => {
    if (selectedLocation) {
      setFormData(prev => ({
        ...prev,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng
      }))
    }
  }, [selectedLocation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate that location is selected
    if (!formData.lat || !formData.lng) {
      setError('Please select a location on the map first')
      return
    }

    if (!formData.description.trim()) {
      setError('Please describe what you found at this location')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setFormData({ description: '', lat: 0, lng: 0, category: 'garbage', photoUrl: '' })
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1100] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Report Pollution Issue</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Location Status */}
          <div className={`p-4 rounded-lg border-2 ${
            selectedLocation 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            {selectedLocation ? (
              <div>
                <p className="text-sm font-medium text-green-800 mb-1">✓ Location Selected</p>
                <p className="text-xs text-green-600">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-yellow-800">
                ⚠ Please click on the map to select a location first
              </p>
            )}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What did you find at this location? *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Large pile of garbage, Deep pothole, Road damage, Sewage overflow, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe what pollution or issue you found at the selected location
            </p>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pollution Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(CATEGORY_CONFIGS).map(([category, config]) => (
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
                </button>
              ))}
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

          {/* Category Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">
              <p>Category: <span className="font-medium">{getCategoryLabel(formData.category)}</span></p>
              <p>Expires in: <span className="font-medium">{CATEGORY_CONFIGS[formData.category].expiryDays} days</span></p>
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
            disabled={isSubmitting || !selectedLocation || !formData.description.trim()}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  )
}
