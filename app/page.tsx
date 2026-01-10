'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Doctor {
  id: number
  name: string
  specialty: string
  clinicAddress: string
  phone: string
  distance: number
}

export default function Home() {
  const [nearestDoctors, setNearestDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)
  const heroSrc = '/hero-ai.svg'

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.')
      return
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ lat: latitude, lng: longitude })
        setLocationError(null)
      },
      (err) => {
        setLocationError('Unable to get your location. Please enable location services.')
        setCurrentLocation(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )

    setWatchId(id)

    return () => {
      if (id !== null) {
        navigator.geolocation.clearWatch(id)
      }
    }
  }, [])

  const handleCallDoctor = async () => {
    setError(null)

    if (!currentLocation && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          })
        })
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationError(null)
      } catch {
        setLocationError('Unable to get your location. Please enable location services.')
      }
    }

    if (!currentLocation) {
      setError('Location not available. Please enable location services.')
      return
    }

    setShowModal(true)
  }

  const [showModal, setShowModal] = useState(false)
  const [callerName, setCallerName] = useState('')
  const [callerPhone, setCallerPhone] = useState('')

  const submitCallForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentLocation) {
      setError('Location not available.')
      setShowModal(false)
      return
    }
    if (!callerPhone.trim() || !callerName.trim()) {
      setError('Please provide your name and phone number.')
      return
    }

    setLoading(true)
    setError(null)
    setShowModal(false)

    try {
      const payload = { ...currentLocation, name: callerName, phone: callerPhone }
      const response = await fetch('/api/call-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to call doctors')
      const data = await response.json()
      setNearestDoctors(data.doctors)
    } catch (err) {
      setError('Failed to find doctors. Please try again.')
    } finally {
      setLoading(false)
      setCallerName('')
      setCallerPhone('')
    }
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Full-page hero background */}
      <section className="relative min-h-screen">
        <Image
          src={heroSrc}
          alt="MyDoctor.mu"
          fill
          priority
          className="object-cover"
          unoptimized
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Centered hero content */}
        <div className="absolute inset-0">
          <div className="h-full max-w-6xl mx-auto px-6">
            <div className="h-full flex flex-col items-center justify-center text-center">
              <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                MyDoctor.mu
              </h1>

              <p className="mt-4 text-base md:text-lg text-white/90 max-w-xl">
                Emergency medical assistance at your fingertips. Get connected with the nearest doctors instantly.
              </p>

              <p className="mt-4 text-sm text-emerald-200/90">
                {currentLocation
                  ? `📍 Location detected: ${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}`
                  : locationError
                    ? locationError
                    : '📍 Detecting your location…'}
              </p>

              <button
                onClick={handleCallDoctor}
                disabled={loading}
                className="mt-6 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg"
              >
                {loading ? 'Finding Doctors...' : '🚨 Call a Doctor'}
              </button>

              {error && <p className="mt-4 text-red-200">{error}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Nearest Doctors Section */}
      {nearestDoctors.length > 0 && (
        <div className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Nearest Doctors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearestDoctors.map((doctor) => (
                <div key={doctor.id} className="bg-gray-50 rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-semibold mb-2">{doctor.name}</h3>
                  <p className="text-gray-600 mb-1">{doctor.specialty}</p>
                  <p className="text-gray-600 mb-1">{doctor.clinicAddress}</p>
                  <p className="text-gray-600 mb-2">📞 {doctor.phone}</p>
                  <p className="text-sm text-gray-500">Distance: {doctor.distance.toFixed(1)} km</p>
                </div>
              ))}
            </div>
            <p className="text-center mt-8 text-gray-600">
              Notifications have been sent to these doctors. Please wait for their response.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p>© 2025 MyDoctor.mu. All rights reserved.</p>
        </div>
      </footer>
      {/* Modal for caller info */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Provide your details</h3>
            <form onSubmit={submitCallForm}>
              <label htmlFor="callerName" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                id="callerName"
                name="callerName"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="mt-1 mb-3 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Your name"
                required
              />

              <label htmlFor="callerPhone" className="block text-sm font-medium text-gray-700">Phone (with country code)</label>
              <input
                id="callerPhone"
                name="callerPhone"
                value={callerPhone}
                onChange={(e) => setCallerPhone(e.target.value)}
                className="mt-1 mb-4 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="+1234567890"
                required
              />

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-red-600 text-white">Send Emergency</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}