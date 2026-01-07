'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Doctor, Patient, Appointment } from '../../lib/db'

export default function Admin() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [callerName, setCallerName] = useState('')
  const [callerPhone, setCallerPhone] = useState('')
  const [callLoading, setCallLoading] = useState(false)
  const [callError, setCallError] = useState<string | null>(null)

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin') === 'true'
    if (!isAdmin) {
      router.push('/admin/login')
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
        fetch('/api/doctors'),
        fetch('/api/patients'),
        fetch('/api/appointments')
      ])
      const doctorsData = await doctorsRes.json()
      const patientsData = await patientsRes.json()
      const appointmentsData = await appointmentsRes.json()
      setDoctors(doctorsData)
      setPatients(patientsData)
      setAppointments(appointmentsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    router.push('/')
  }

  const handleCallDoctor = () => {
    setShowModal(true)
  }

  const submitCallForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!callerPhone.trim() || !callerName.trim()) {
      setCallError('Please provide your name and phone number.')
      return
    }

    setCallLoading(true)
    setCallError(null)
    setShowModal(false)

    try {
      // Use default location for admin calls (Port Louis, Mauritius)
      const payload = { lat: -20.165, lng: 57.501, name: callerName, phone: callerPhone }
      const response = await fetch('/api/call-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to call doctors')
      const data = await response.json()
      alert(`Emergency call sent! Doctors notified: ${data.doctors.map((d: any) => d.name).join(', ')}`)
    } catch (err) {
      setCallError('Failed to find doctors. Please try again.')
    } finally {
      setCallLoading(false)
      setCallerName('')
      setCallerPhone('')
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-4xl mr-4">⚙️</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">System administration and management</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleCallDoctor}
                disabled={callLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
              >
                {callLoading ? 'Calling...' : '🚨 Call a Doctor'}
              </button>
              <button
                onClick={handleLogout}
                className="professional-btn-danger"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="professional-card">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👨‍⚕️</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Doctors</h3>
                <p className="text-2xl font-bold text-blue-600">{doctors.length}</p>
              </div>
            </div>
          </div>
          <div className="professional-card">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👥</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Patients</h3>
                <p className="text-2xl font-bold text-green-600">{patients.length}</p>
              </div>
            </div>
          </div>
          <div className="professional-card">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📅</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Appointments</h3>
                <p className="text-2xl font-bold text-purple-600">{appointments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Section */}
        <div className="professional-card mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Doctors ({doctors.length})</h2>
          <div className="overflow-x-auto">
            <table className="professional-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialty</th>
                  <th>Experience</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>{doctor.id}</td>
                    <td>{doctor.name}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.specialty}</td>
                    <td>{doctor.experience} years</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patients Section */}
        <div className="professional-card mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Patients ({patients.length})</h2>
          <div className="overflow-x-auto">
            <table className="professional-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.id}</td>
                    <td>{patient.name}</td>
                    <td>{patient.email}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="professional-card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Appointments ({appointments.length})</h2>
          <div className="overflow-x-auto">
            <table className="professional-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Doctor ID</th>
                  <th>Patient ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.id}</td>
                    <td>{appointment.doctorId}</td>
                    <td>{appointment.patientId}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for caller info */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Provide your details</h3>
            <form onSubmit={submitCallForm}>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="mt-1 mb-3 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />

              <label className="block text-sm font-medium text-gray-700">Phone (with country code)</label>
              <input
                value={callerPhone}
                onChange={(e) => setCallerPhone(e.target.value)}
                className="mt-1 mb-4 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="+23057808272"
                required
              />

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-red-600 text-white">Send Emergency</button>
              </div>
            </form>
            {callError && <p className="mt-4 text-red-500">{callError}</p>}
          </div>
        </div>
      )}
    </main>
  )
}