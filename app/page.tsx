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
  const [loading] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)
  const mahadoorPhone = '+23057447700'
  const [callTarget] = useState<{ name: string; phone: string } | null>({
    name: 'Dr. Mahadoor',
    phone: mahadoorPhone
  })
  const [showConsent, setShowConsent] = useState(false)

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
    try {
      const accepted = window.localStorage.getItem('termsAccepted') === 'true'
      setShowConsent(!accepted)
    } catch {
      setShowConsent(true)
    }

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

  const handleAgree = () => {
    try {
      window.localStorage.setItem('termsAccepted', 'true')
    } catch {
      // ignore
    }
    setShowConsent(false)
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
              loading={loading}
              ariaLabel="Call a Doctor"
              size="lg"
              href={`tel:${mahadoorPhone}`}
            />
          </div>

          {callTarget && (
            <div className="mt-4 text-emerald-800">
              <p>Calling {callTarget.name}. If it doesn&apos;t open automatically, tap below:</p>
              <a
                href={`tel:${callTarget.phone}`}
                className="inline-block mt-2 underline text-emerald-700 font-semibold"
              >
                {callTarget.phone}
              </a>
            </div>
          )}

          {!callTarget && <p className="mt-4 text-red-700">Unable to place a call.</p>}
        </div>
      </section>

      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 text-left shadow-2xl">
            <h2 className="text-2xl font-semibold text-slate-900">Terms &amp; Privacy</h2>
            <p className="mt-2 text-slate-600">
              Please review and accept our Terms &amp; Conditions and Privacy Policy to continue.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a href="/terms" className="underline text-blue-600">View Terms &amp; Conditions</a>
              <a href="/privacy" className="underline text-blue-600">View Privacy Policy</a>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleAgree}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-white font-semibold"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p>© {currentYear} mydoctor.mu. All rights reserved.</p>
          <p className="mt-2 text-sm flex flex-col md:flex-row gap-1 md:gap-4 justify-center items-center">
            <a href="/privacy" className="underline hover:text-blue-300 transition-colors">Privacy Policy</a>
            <span className="hidden md:inline">|</span>
            <a href="/terms" className="underline hover:text-blue-300 transition-colors">Terms &amp; Conditions</a>
          </p>
        </div>
      </footer>
    </main>
  )
}