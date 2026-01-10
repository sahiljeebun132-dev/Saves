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

  const normalizePhoneForTel = (raw: string) => {
    const trimmed = String(raw || '').trim()
    if (!trimmed) return ''

    const hasLeadingPlus = trimmed.startsWith('+')
    const digitsOnly = trimmed.replace(/[^0-9]/g, '')
    if (!digitsOnly) return ''
    return hasLeadingPlus ? `+${digitsOnly}` : digitsOnly
  }

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
    try {
      setLoading(true)
      setError(null)

      const getBestAvailableDoctorPhone = async () => {
        const doctorsRes = await fetch('/api/doctors')
        if (!doctorsRes.ok) return ''
        const allDoctors = await doctorsRes.json()
        const first = Array.isArray(allDoctors) ? allDoctors[0] : null
        return first?.phone ? normalizePhoneForTel(String(first.phone)) : ''
      }

      let location = currentLocation

      if (!location && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            })
          })
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setCurrentLocation(location)
          setLocationError(null)
        } catch {
          setLocationError('Unable to get your location. Please enable location services.')
        }
      }

      if (!location) {
        const telPhone = await getBestAvailableDoctorPhone()
        if (telPhone) {
          window.location.href = `tel:${telPhone}`
          return
        }
        setError('Location not available. Please enable location services.')
        return
      }

      const payload = { ...location, mode: 'direct' }
      const response = await fetch('/api/call-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to call doctors')
      const data = await response.json()
      setNearestDoctors(data.doctors)

      const primary = Array.isArray(data?.doctors) ? data.doctors[0] : null
      const telPhone = primary?.phone ? normalizePhoneForTel(primary.phone) : ''
      if (telPhone) {
        window.location.href = `tel:${telPhone}`
        return
      }

      setError('No doctor phone number available to call.')
    } catch {
      setError('Failed to connect to a doctor. Please try again.')
    } finally {
      setLoading(false)
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
                {loading ? 'Calling Doctor...' : '🚨 Call a Doctor'}
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

                  <a
                    href={`tel:${normalizePhoneForTel(doctor.phone)}`}
                    className="mt-4 inline-block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                  >
                    Call Now
                  </a>
                </div>
              ))}
            </div>
            <p className="text-center mt-8 text-gray-600">
              Select a doctor to call them directly.
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
    </main>
  )
}