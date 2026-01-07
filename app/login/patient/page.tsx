'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPatient() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/login/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        const user = await response.json()
        localStorage.setItem('patient', JSON.stringify(user))
        alert('Login successful!')
        // Redirect to patient dashboard or home
        window.location.href = '/'
      } else {
        alert('Invalid credentials')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-3xl font-bold text-gray-800">Patient Login</h1>
          <p className="text-gray-600 mt-2">Access your healthcare portal</p>
        </div>

        <form onSubmit={handleSubmit} className="professional-form">
          <div className="mb-6">
            <label htmlFor="email" className="professional-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="professional-input"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-8">
            <label htmlFor="password" className="professional-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="professional-input"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="professional-btn-primary w-full"
          >
            Sign In
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register/patient" className="text-blue-600 hover:text-blue-800 font-medium">
            Register here
          </Link>
        </p>
      </div>
    </main>
  )
}