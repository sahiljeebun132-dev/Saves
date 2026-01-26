'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginDoctor() {
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
      const response = await fetch('/api/login/doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        const user = await response.json()
        localStorage.setItem('doctor', JSON.stringify(user))
        alert('Login successful!')
        // Redirect to doctor dashboard
        window.location.href = '/doctor/dashboard'
      } else {
        alert('Invalid credentials')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👨‍⚕️</div>
          <h1 className="text-3xl font-bold text-gray-800">Doctor Login</h1>
          <p className="text-gray-600 mt-2">Access your medical practice dashboard</p>
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
            className="professional-btn-secondary w-full"
          >
            Sign In
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register/doctor" className="text-red-600 hover:text-red-800 font-medium">
            Register here
          </Link>
        </p>
      </div>
    </main>
  )
}