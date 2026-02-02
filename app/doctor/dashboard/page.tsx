'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Patient = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  favoriteDoctorIds?: string[];
};

type Appointment = {
  _id: string;
  doctorId: string | { _id: string };
  patientId: string | { _id: string };
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  report?: string;
};

type Doctor = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specialty: string;
  experience: number;
  clinicAddress: string;
  availableHours: string;
  location: { lat: number; lng: number };
  password: string;
  callLogs: DoctorCallLog[];
};

type DoctorCallLog = {
  timestamp: string;
  patientName?: string;
  patientPhone?: string;
  location?: { lat: number; lng: number };
  report?: string;
};

export default function DoctorDashboard() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
    const [reportEdits, setReportEdits] = useState<{ [id: string]: string }>({})
    const [reportLoading, setReportLoading] = useState<{ [id: string]: boolean }>({})
  const [callLogs, setCallLogs] = useState<DoctorCallLog[]>([])
  const [callReports, setCallReports] = useState<{ [idx: number]: string }>({})
  const [callReportLoading, setCallReportLoading] = useState<{ [idx: number]: boolean }>({})
  const [loading, setLoading] = useState(true)

    const onCallReportSubmit = async (idx: number) => {
      const report = callReports[idx]?.trim()
      if (!report || !doctor) return
      setCallReportLoading(prev => ({ ...prev, [idx]: true }))
      try {
        const res = await fetch('/api/doctors', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorId: doctor._id, logIndex: idx, report })
        })
        if (res.ok) {
          setCallReportLoading(prev => ({ ...prev, [idx]: false }))
          setCallReports(edits => {
            const next = { ...edits }
            delete next[idx]
            return next
          })
          // Refresh call logs
          fetch('/api/doctors')
            .then(res => res.json())
            .then((allDoctors: Doctor[]) => {
              const me = allDoctors.find((d: Doctor) => d._id === doctor._id)
              setCallLogs(me?.callLogs || [])
            })
        } else {
          alert('Failed to save report')
          setCallReportLoading(prev => ({ ...prev, [idx]: false }))
        }
      } catch {
        alert('Failed to save report')
        setCallReportLoading(prev => ({ ...prev, [idx]: false }))
      }
    }

    const handleCallReportChange = (idx: number, value: string) => {
      setCallReports(prev => ({ ...prev, [idx]: value }))
    }

    useEffect(() => {
    const loggedDoctor = localStorage.getItem('doctor')
    if (!loggedDoctor) {
      router.push('/login/doctor')
      return
    }

    const parsedDoctor = JSON.parse(loggedDoctor);
    setDoctor(parsedDoctor);

    // Fetch appointments for this doctor
    fetch('/api/appointments')
      .then(res => res.json())
      .then((allAppointments: Appointment[]) => {
        const doctorAppointments = allAppointments.filter((app: Appointment) => {
          // Support both string and object doctorId
          return app.doctorId === parsedDoctor._id || (app.doctorId && typeof app.doctorId === 'object' && (app.doctorId as any)._id === parsedDoctor._id);
        });
        setAppointments(doctorAppointments);
        // Initialize report edits for appointments without a report
        const initialReports: Record<string, string> = {};
        doctorAppointments.forEach(app => {
          if (!app.report) initialReports[(app._id || (app as any).id) as string] = '';
        });
        setReportEdits(initialReports);

        // Get unique patient IDs
        const patientIds = Array.from(new Set(doctorAppointments.map(app => app.patientId)));

        // Fetch patients
        fetch('/api/patients')
          .then(res => res.json())
          .then((allPatients: Patient[]) => {
            const doctorPatients = allPatients.filter((p: Patient) => patientIds.includes((p._id || (p as any).id) as string));
            setPatients(doctorPatients);
            setLoading(false);
          });
      });

    // Fetch call logs for this doctor
    fetch('/api/doctors')
      .then(res => res.json())
      .then((allDoctors: Doctor[]) => {
        const foundDoctor = allDoctors.find((d: Doctor) => d._id === parsedDoctor._id);
        setCallLogs(foundDoctor?.callLogs || []);

        // Initialize call reports for logs without a report
        const initialCallReports: Record<number, string> = {};
        (foundDoctor?.callLogs || []).forEach((log, idx) => {
          if (!log.report) {
            initialCallReports[idx] = '';
          }
        });
        setCallReports(initialCallReports);
      })
      .catch(error => {
        console.error('Failed to fetch call logs:', error);
      });

    const onCallReportSubmit = async (idx: number) => {
      const report = callReports[idx]?.trim()
      if (!report || !doctor) return
      setCallReportLoading(prev => ({ ...prev, [idx]: true }))
      try {
        const res = await fetch('/api/doctors', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorId: doctor._id, logIndex: idx, report })
        })
        if (res.ok) {
          setCallReportLoading(prev => ({ ...prev, [idx]: false }))
          setCallReports(edits => {
            const next = { ...edits }
            delete next[idx]
            return next
          })
          // Refresh call logs
          fetch('/api/doctors')
            .then(res => res.json())
            .then((allDoctors: Doctor[]) => {
              const me = allDoctors.find((d: Doctor) => d._id === doctor._id)
              setCallLogs(me?.callLogs || [])
            })
        } else {
          alert('Failed to save report')
          setCallReportLoading(prev => ({ ...prev, [idx]: false }))
        }
      } catch {
        alert('Failed to save report')
        setCallReportLoading(prev => ({ ...prev, [idx]: false }))
      }
    }

    const handleCallReportChange = (idx: number, value: string) => {
      setCallReports(prev => ({ ...prev, [idx]: value }))
    }
    setLoading(false)
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

  const handleReportChange = (id: string, value: string) => {
    setReportEdits(prev => ({ ...prev, [id]: value }))
  }

  const handleReportSubmit = async (id: string) => {
    const report = reportEdits[id]?.trim()
    if (!report) return;
    setReportLoading(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, report })
      })
      if (res.ok) {
        setAppointments(apps => apps.map(a => (a._id === String(id) ? { ...a, report } : a)))
        setReportEdits(edits => {
          const next = { ...edits }
          delete next[id]
          return next
        })
      } else {
        alert('Failed to save report')
      }
    } catch {
      alert('Failed to save report')
    } finally {
      setReportLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  // Check if any call log is missing a report
  const missingCallReport = callLogs.some((log) => !log.report);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Welcome Banner */}
      <div className="bg-blue-600 text-white py-6 mb-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-2">Welcome, Dr. {doctor.name}!</h1>
          <p className="text-lg">This is your dedicated doctor dashboard. Here you can view your call records, manage appointments, and submit mandatory reports for every call.</p>
        </div>
      </div>
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
                  <tr key={patient._id}>
                    <td>{patient._id}</td>
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

        {/* Call Log Section */}
        <div className="professional-card mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Incoming Call Log</h2>
          {missingCallReport && (
            <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-800 font-semibold text-base rounded shadow">
              <span className="block text-lg mb-1">Mandatory Action Required</span>
              You must submit a report for <b>every call</b> you receive. <br />
              <span className="font-bold">Payroll will not process unless all call reports are completed.</span>
            </div>
          )}
          {callLogs.length === 0 ? (
            <div className="text-gray-500">No calls received yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="professional-table">
                <thead>
                  <tr>
                    <th>Date/Time</th>
                    <th>Patient Name</th>
                    <th>Patient Phone</th>
                    <th>Location</th>
                    <th>Report</th>
                  </tr>
                </thead>
                <tbody>
                  {callLogs.slice().reverse().map((log, idx) => (
                    <tr key={idx}>
                      <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</td>
                      <td>{log.patientName || '-'}</td>
                      <td>{log.patientPhone || '-'}</td>
                      <td>{log.location ? `${log.location.lat.toFixed(4)}, ${log.location.lng.toFixed(4)}` : '-'}</td>
                      <td>
                        {log.report ? (
                          <span className="text-green-700">Submitted</span>
                        ) : (
                          <form
                            onSubmit={e => {
                              e.preventDefault();
                              onCallReportSubmit(idx);
                            }}
                            className="flex flex-col gap-2"
                          >
                            <textarea
                              required
                              value={callReports[idx] || ''}
                              onChange={e => handleCallReportChange(idx, e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Enter mandatory report..."
                              rows={2}
                            />
                            <button
                              type="submit"
                              className="bg-blue-500 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                              disabled={callReportLoading[idx]}
                            >
                              {callReportLoading[idx] ? 'Saving...' : 'Submit Report'}
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>{appointment._id}</td>
                    <td>{typeof appointment.patientId === 'string' ? appointment.patientId : appointment.patientId?._id}</td>
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
                    <td>
                      {appointment.report ? (
                        <span className="text-green-700">Submitted</span>
                      ) : (
                        <form
                          onSubmit={e => {
                            e.preventDefault()
                              handleReportSubmit(appointment._id)
                          }}
                          className="flex flex-col gap-2"
                        >
                          <textarea
                            required
                            value={reportEdits[appointment._id] || ''}
                            onChange={e => handleReportChange(appointment._id, e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="Enter mandatory report..."
                            rows={2}
                          />
                          <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                            disabled={reportLoading[appointment._id]}
                          >
                             {reportLoading[appointment._id] ? 'Saving...' : 'Submit Report'}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {missingCallReport && (
              <div className="mt-4 text-red-600 font-semibold text-sm">
                You must submit a report for every appointment. Payroll will not process without all reports.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}