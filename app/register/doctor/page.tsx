'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterDoctor() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    licenseNumber: '',
    specialty: '',
    experience: '',
    clinicAddress: '',
    availableHours: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          experience: parseInt(formData.experience),
          location: { lat: -20.2, lng: 57.5 } // Default location, can be updated later
        }),
      })
      if (response.ok) {
        alert('Doctor registered successfully!')
        // Reset form or redirect
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          licenseNumber: '',
          specialty: '',
          experience: '',
          clinicAddress: '',
          availableHours: ''
        })
      } else {
        alert('Failed to register doctor')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">👨‍⚕️</div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Registration</h1>
          <p className="text-gray-600 mt-2">Join our medical network and start helping patients</p>
        </div>

        <div className="professional-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="professional-label">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="professional-input"
                />
              </div>

              <div>
                <label htmlFor="email" className="professional-label">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="professional-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="professional-label">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="professional-input"
                />
              </div>

              <div>
                <label htmlFor="password" className="professional-label">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="professional-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="licenseNumber" className="professional-label">Medical License Number *</label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  required
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="professional-input"
                />
              </div>

              <div>
                <label htmlFor="specialty" className="professional-label">Medical Specialty *</label>
                <select
                  id="specialty"
                  name="specialty"
                  required
                  value={formData.specialty}
                  onChange={handleChange}
                  className="professional-input"
                >
                  <option value="">Select Specialty</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Family Medicine">Family Medicine</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="experience" className="professional-label">Years of Experience *</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  required
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
                  className="professional-input"
                />
              </div>

              <div>
                <label htmlFor="clinicAddress" className="professional-label">Clinic Address *</label>
                <textarea
                  id="clinicAddress"
                  name="clinicAddress"
                  required
                  value={formData.clinicAddress}
                  onChange={handleChange}
                  rows={3}
                  className="professional-input"
                ></textarea>
              </div>
            </div>

            <div>
              <label htmlFor="availableHours" className="professional-label">Available Hours *</label>
              <textarea
                id="availableHours"
                name="availableHours"
                required
                value={formData.availableHours}
                onChange={handleChange}
                rows={2}
                placeholder="e.g., Mon-Fri 9AM-5PM, Sat 10AM-2PM"
                className="professional-input"
              ></textarea>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="professional-btn-primary w-full"
              >
                Register as Doctor
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}