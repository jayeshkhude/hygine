'use client'

import { useState } from 'react'
import { MapPin, AlertTriangle, BarChart3, Upload, Plus, ArrowRight, CheckCircle } from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Report Pollution Issues",
      description: "Click on the map to select a location and report pollution problems like garbage, potholes, road damage, and more"
    },
    {
      icon: <AlertTriangle className="h-8 w-8" />,
      title: "Easy Location Selection",
      description: "Simply click anywhere on the map to pinpoint the exact location of the pollution issue"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Track & Monitor",
      description: "View trends, analyze data, and monitor city-wide pollution issues"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-extrabold text-primary mb-6 tracking-tight">
            City Pollution Monitor
            <span className="block text-4xl text-muted mt-2">Risk Monitor</span>
          </h1>
          <p className="text-xl text-muted mb-8 max-w-2xl mx-auto leading-relaxed">
            A simple platform for reporting and tracking pollution issues across the city. Click on the map to report problems. 
            Help keep your community clean and safe.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={onGetStarted}
              className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="border-2 border-primary text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary hover:text-white transition-all">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg border border-border text-center hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Submit a Report</h3>
                <p className="text-muted">Click anywhere on the map to select a location, then describe what pollution issue you found (garbage, pothole, road damage, etc.)</p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Automatic Risk Assessment</h3>
                <p className="text-muted">Our system automatically classifies the issue and assigns a risk level (Low, Medium, High) with priority scoring.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Real-time Monitoring</h3>
                <p className="text-muted">Track all reports on the interactive map, view trends in charts, and monitor city-wide pollution issues.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Categories */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Risk Categories</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-2xl mb-2">🔴</div>
              <h3 className="font-semibold text-red-800 mb-2">High Risk</h3>
              <p className="text-sm text-red-600">Dead animals, sewage overflow (1-2 days expiry)</p>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
              <div className="text-2xl mb-2">🟠</div>
              <h3 className="font-semibold text-orange-800 mb-2">Medium Risk</h3>
              <p className="text-sm text-orange-600">Mosquito breeding, garbage (3-5 days expiry)</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <div className="text-2xl mb-2">🟡</div>
              <h3 className="font-semibold text-yellow-800 mb-2">Low Risk</h3>
              <p className="text-sm text-yellow-600">Toilet issues, general dirt (7 days expiry)</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-2xl mb-2">🟢</div>
              <h3 className="font-semibold text-green-800 mb-2">No Risk</h3>
              <p className="text-sm text-green-600">Clean areas with no reported issues</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="bg-primary text-white rounded-2xl p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of citizens helping to report and track pollution issues
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
          >
            Start Monitoring Now
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 text-center text-muted border-t border-border">
        <p>&copy; 2024 City Pollution Monitor. Made for cleaner cities.</p>
      </footer>
    </div>
  )
} 