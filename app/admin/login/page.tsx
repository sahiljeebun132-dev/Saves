'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.username === 'admin' && formData.password === '12qsawzx') {
      localStorage.setItem('admin', 'true')
      router.push('/admin')
    } else {
      alert('Invalid credentials')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600 mt-2">System administration access</p>
        </div>

        <form onSubmit={handleSubmit} className="professional-form">
          <div className="mb-6">
            <label htmlFor="username" className="professional-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="professional-input"
              placeholder="Enter admin username"
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
              placeholder="Enter admin password"
            />
          </div>

          <button
            type="submit"
            className="professional-btn-gray w-full"
          >
            Sign In
          </button>
        </form>
      </div>
    </main>
  )
}