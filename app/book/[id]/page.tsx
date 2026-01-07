'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Doctor } from '../../../lib/db'

export default function BookDoctorAppointment() {
  const params = useParams() as { id?: string } | null
  const doctorId = Number.parseInt(params?.id ?? '', 10)
  const isValidDoctorId = Number.isFinite(doctorId) && doctorId > 0
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    patientAddress: '',
    date: '',
    time: '',
    reason: ''
  })

  useEffect(() => {
    if (!isValidDoctorId) {
      setDoctor(null)
      setLoading(false)
      return
    }
    fetch(`/api/doctors`)
      .then(res => res.json())
      .then((doctors: Doctor[]) => {
        const foundDoctor = doctors.find(d => d.id === doctorId)
        setDoctor(foundDoctor || null)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to fetch doctor:', error)
        setLoading(false)
      })
  }, [doctorId, isValidDoctorId])

  if (!isValidDoctorId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid doctor.</p>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // First, register the patient
      const patientResponse = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.patientName,
          email: formData.patientEmail,
          phone: formData.patientPhone,
          address: formData.patientAddress
        }),
      })
      if (!patientResponse.ok) {
        alert('Failed to register patient')
        return
      }
      const patient = await patientResponse.json()

      // Then, book the appointment
      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId,
          patientId: patient.id,
          date: formData.date,
          time: formData.time,
          status: 'pending'
        }),
      })
      if (appointmentResponse.ok) {
        alert('Appointment booked successfully!')
        // Reset form
        setFormData({
          patientName: '',
          patientEmail: '',
          patientPhone: '',
          patientAddress: '',
          date: '',
          time: '',
          reason: ''
        })
      } else {
        alert('Failed to book appointment')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!doctor) {
    return <div className="container mx-auto px-4 py-8">Doctor not found</div>
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Book Appointment with {doctor.name}</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Doctor Information</h2>
        <p><strong>Name:</strong> {doctor.name}</p>
        <p><strong>Specialty:</strong> {doctor.specialty}</p>
        <p><strong>Email:</strong> {doctor.email}</p>
        <p><strong>Phone:</strong> {doctor.phone}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Patient Information</h2>

        <div className="mb-4">
          <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            id="patientName"
            name="patientName"
            required
            value={formData.patientName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="patientEmail" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            id="patientEmail"
            name="patientEmail"
            required
            value={formData.patientEmail}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="patientPhone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input
            type="tel"
            id="patientPhone"
            name="patientPhone"
            required
            value={formData.patientPhone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="patientAddress" className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <input
            type="text"
            id="patientAddress"
            name="patientAddress"
            required
            value={formData.patientAddress}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <h2 className="text-xl font-semibold mb-4 mt-8">Appointment Details</h2>

        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Preferred Time *</label>
          <input
            type="time"
            id="time"
            name="time"
            required
            value={formData.time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit *</label>
          <textarea
            id="reason"
            name="reason"
            required
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Book Appointment
        </button>
      </form>
    </main>
  )
}