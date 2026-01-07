'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPatient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    medicalHistory: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        alert('Patient registered successfully!')
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          dateOfBirth: '',
          address: '',
          emergencyContact: '',
          medicalHistory: ''
        })
      } else {
        alert('Failed to register patient')
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
          <div className="text-5xl mb-4">👤</div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Registration</h1>
          <p className="text-gray-600 mt-2">Create your account to book appointments</p>
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
                <label htmlFor="dateOfBirth" className="professional-label">Date of Birth *</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="professional-input"
                />
              </div>

              <div>
                <label htmlFor="emergencyContact" className="professional-label">Emergency Contact *</label>
                <input
                  type="text"
                  id="emergencyContact"
                  name="emergencyContact"
                  required
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="professional-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="professional-label">Address *</label>
              <textarea
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="professional-input"
              ></textarea>
            </div>

            <div>
              <label htmlFor="medicalHistory" className="professional-label">Medical History (Optional)</label>
              <textarea
                id="medicalHistory"
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                rows={4}
                placeholder="Please describe any relevant medical history, allergies, or current medications..."
                className="professional-input"
              ></textarea>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="professional-btn-primary w-full"
              >
                Register as Patient
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