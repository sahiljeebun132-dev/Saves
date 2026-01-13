'use client'

import { useState, useEffect } from 'react'
import EmergencyCrossButton from './components/EmergencyCrossButton'

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

  const currentYear = new Date().getFullYear()

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
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            One Tap, One Doc: Heathcare at Your Fingertips
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

          <div className="mt-8 flex items-center justify-center">
            <EmergencyCrossButton
              onClick={handleCallDoctor}
              loading={loading}
              ariaLabel="Call a Doctor"
              size="lg"
            />
          </div>

          {error && <p className="mt-4 text-red-700">{error}</p>}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p>© {currentYear} One Tap, One Doc. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}