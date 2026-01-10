'use client'

import { useState, useEffect } from 'react'

interface Doctor {
  id: number
  name: string
  specialty: string
  clinicAddress: string
  phone: string
  distance: number
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)

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
    <main className="min-h-screen bg-gradient-to-br from-lime-50 to-yellow-50">
      <section className="min-h-[85vh] flex items-center justify-center px-6">
        <div className="w-full max-w-3xl text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-emerald-600 shadow-lg flex items-center justify-center text-white text-3xl">
            ✚
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            MyDoctor.mu
          </h1>

          <p className="mt-4 text-base md:text-lg text-slate-700 max-w-xl mx-auto">
            Emergency medical assistance at your fingertips. Call the nearest doctor instantly.
          </p>

          <p className="mt-4 text-sm text-emerald-700">
            {currentLocation
              ? `📍 Location detected: ${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}`
              : locationError
                ? locationError
                : '📍 Detecting your location…'}
          </p>

          <button
            onClick={handleCallDoctor}
            disabled={loading}
            className="mt-8 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white font-bold py-4 px-10 rounded-xl transition duration-300 shadow-lg"
          >
            {loading ? 'Calling Doctor...' : 'Call a Doctor'}
          </button>

          {error && <p className="mt-4 text-red-700">{error}</p>}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p>© 2025 MyDoctor.mu. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}