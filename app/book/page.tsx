'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { Doctor } from '../../lib/db'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

export default function BookAppointment() {
  const [doctors, setDoctors] = useState<(Doctor & { distance: number; estimatedTime: string })[]>([])
  const [rawDoctors, setRawDoctors] = useState<Doctor[]>([])
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isClient, setIsClient] = useState(false)

  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  useEffect(() => {
    setIsClient(true)
    // Fix for default markers in react-leaflet - only on client side
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    })
  }, [])

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          // Fallback to mock location in Mauritius
          setUserLocation({ lat: -20.2, lng: 57.5 })
        }
      )
    } else {
      // Fallback when geolocation is not supported
      setUserLocation({ lat: -20.2, lng: 57.5 })
    }

    // Fetch doctors from API
    fetch('/api/doctors')
      .then(res => res.json())
      .then((fetchedDoctors: Doctor[]) => {
        setRawDoctors(fetchedDoctors)
      })
      .catch(error => console.error('Failed to fetch doctors:', error))
  }, [])

  useEffect(() => {
    if (!userLocation || rawDoctors.length === 0) return

    const estimatedTimes = ['2 hours', '1 hour', '3 hours', '30 minutes']
    const doctorsWithDistance = rawDoctors
      .map((doctor, index) => ({
        ...doctor,
        distance: haversineDistance(userLocation.lat, userLocation.lng, doctor.location.lat, doctor.location.lng),
        estimatedTime: estimatedTimes[index] || '1 hour'
      }))
      .sort((a, b) => a.distance - b.distance)

    setDoctors(doctorsWithDistance)
  }, [rawDoctors, userLocation])

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Book an Appointment</h1>
      <p className="text-center mb-8">Find the closest doctors and book your appointment.</p>

      <div className="mb-8">
        {isClient && (
          <MapContainer center={[-20.2, 57.5]} zoom={10} style={{ height: '400px', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {doctors.map((doctor) => (
              <Marker key={doctor.id} position={[doctor.location.lat, doctor.location.lng]}>
                <Popup>
                  <div>
                    <h3>{doctor.name}</h3>
                    <p>{doctor.specialty}</p>
                    <p>Distance: {doctor.distance.toFixed(2)} km</p>
                    <Link href={`/book/${doctor.id}`}>Book Appointment</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>You are here</Popup>
              </Marker>
            )}
          </MapContainer>
        )}
        {!isClient && (
          <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <p>Loading map...</p>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">{doctor.name}</h2>
            <p className="text-gray-600 mb-2">{doctor.specialty}</p>
            <p className="text-sm text-gray-500 mb-2">Distance: {doctor.distance.toFixed(2)} km</p>
            <p className="text-sm text-gray-500 mb-4">Estimated wait time: {doctor.estimatedTime}</p>
            <Link
              href={`/book/${doctor.id}`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full text-center block"
            >
              Book Appointment
            </Link>
          </div>
        ))}
      </div>
    </main>
  )
}