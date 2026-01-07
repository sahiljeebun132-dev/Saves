'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Doctor, Patient, Appointment } from '../../../lib/db'

export default function DoctorDashboard() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loggedDoctor = localStorage.getItem('doctor')
    if (!loggedDoctor) {
      router.push('/login/doctor')
      return
    }
    const parsedDoctor = JSON.parse(loggedDoctor)
    setDoctor(parsedDoctor)

    // Fetch appointments for this doctor
    fetch('/api/appointments')
      .then(res => res.json())
      .then((allAppointments: Appointment[]) => {
        const doctorAppointments = allAppointments.filter(app => app.doctorId === parsedDoctor.id)
        setAppointments(doctorAppointments)

        // Get unique patient IDs
        const patientIds = Array.from(new Set(doctorAppointments.map(app => app.patientId)))

        // Fetch patients
        fetch('/api/patients')
          .then(res => res.json())
          .then((allPatients: Patient[]) => {
            const doctorPatients = allPatients.filter(p => patientIds.includes(p.id))
            setPatients(doctorPatients)
            setLoading(false)
          })
      })
      .catch(error => {
        console.error('Failed to fetch data:', error)
        setLoading(false)
      })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('doctor')
    router.push('/')
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!doctor) {
    return <div className="container mx-auto px-4 py-8">Access denied</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-4xl mr-4">🏥</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-gray-600">Manage your patients and appointments</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="professional-btn-danger"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="professional-card">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👥</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Patients</h3>
                <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
              </div>
            </div>
          </div>
          <div className="professional-card">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📅</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Appointments</h3>
                <p className="text-2xl font-bold text-green-600">{appointments.length}</p>
              </div>
            </div>
          </div>
          <div className="professional-card">
            <div className="flex items-center">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmed Appointments</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {appointments.filter(app => app.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Info Card */}
        <div className="professional-card mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Doctor Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600"><strong>Name:</strong> Dr. {doctor.name}</p>
              <p className="text-gray-600"><strong>Specialty:</strong> {doctor.specialty}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Email:</strong> {doctor.email}</p>
              <p className="text-gray-600"><strong>Phone:</strong> {doctor.phone}</p>
            </div>
          </div>
        </div>

        {/* Patients Section */}
        <div className="professional-card mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Patients ({patients.length})</h2>
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
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Appointments ({appointments.length})</h2>
          <div className="overflow-x-auto">
            <table className="professional-table">
              <thead>
                <tr>
                  <th>ID</th>
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
    </main>
  )
}