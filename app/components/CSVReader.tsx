'use client'

import { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import Papa from 'papaparse'

interface CSVReaderProps {
  onDataUpload: (data: any[]) => void
}

export function CSVReader({ onDataUpload }: CSVReaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    setError('')
    setSuccess(false)

    try {
      const text = await file.text()
      const result = Papa.parse(text, { header: true, skipEmptyLines: true })
      
      if (result.errors.length > 0) {
        setError('Error parsing CSV file. Please check the format.')
        return
      }

      const data = result.data
      
      // Validate required columns
      const requiredColumns = ['text', 'location', 'date']
      const firstRow = data[0] as any
      const missingColumns = requiredColumns.filter(col => !(col in firstRow))
      
      if (missingColumns.length > 0) {
        setError(`Missing required columns: ${missingColumns.join(', ')}`)
        return
      }

      // Filter out empty rows
      const validData = data.filter((row: any) => 
        row.text && row.location && row.date
      )

      if (validData.length === 0) {
        setError('No valid data found in CSV file')
        return
      }

      onDataUpload(validData)
      setSuccess(true)
      setError('')
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to read file. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        handleFileUpload(file)
      } else {
        setError('Please upload a CSV file')
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary bg-opacity-5'
            : 'border-border hover:border-primary'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-8 w-8 text-muted mb-3" />
        <p className="text-sm text-muted mb-2">
          Drag and drop a CSV file here, or click to browse
        </p>
        <p className="text-xs text-muted mb-4">
          Required columns: text, location, date
        </p>
        
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileInput}
          className="hidden"
          id="csv-upload"
          disabled={isProcessing}
        />
        <label
          htmlFor="csv-upload"
          className={`inline-block px-4 py-2 rounded-lg cursor-pointer transition-colors ${
            isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-opacity-90'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Choose File'}
        </label>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-600">CSV uploaded successfully!</span>
        </div>
      )}

      {/* Sample Format */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Sample CSV Format
        </h4>
        <div className="text-xs font-mono bg-white p-2 rounded border">
          text,location,date<br />
          &quot;Garbage overflow in Central Park&quot;,&quot;Central Park, NYC&quot;,&quot;2024-01-15&quot;<br />
          &quot;Bad smell from drain&quot;,&quot;Broadway St, NYC&quot;,&quot;2024-01-16&quot;
        </div>
      </div>
    </div>
  )
} 