// (removed stray object literal)
import fs from 'fs'
import path from 'path'

// Use environment variable to determine if we're in production
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'

const dataPath = path.join(process.cwd(), 'data.json')

export interface DoctorCallLog {
  timestamp: string // ISO
  patientName?: string
  patientPhone?: string
  location?: { lat: number; lng: number }
}

export interface Doctor {
  id: number
  name: string
  email: string
  phone: string
  licenseNumber: string
  specialty: string
  experience: number
  clinicAddress: string
  availableHours: string
  location: { lat: number; lng: number }
  password: string
  callLogs?: DoctorCallLog[]
}

export interface Patient {
  id: number
  name: string
  email: string
  phone: string
  address: string
  password: string
  favoriteDoctorIds?: number[]
}

export interface Appointment {
  id: number
  doctorId: number
  patientId: number
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  report?: string
}
export function updateAppointmentReport(appointmentId: number, report: string): Appointment | undefined {
  if (isProduction) {
    const appointment = defaultData.appointments.find(a => a.id === appointmentId)
    if (!appointment) return undefined
    return { ...appointment, report }
  }

  const data = readData()
  const idx = data.appointments.findIndex(a => a.id === appointmentId)
  if (idx === -1) return undefined
  data.appointments[idx] = {
    ...data.appointments[idx],
    report
  }
  writeData(data)
  return data.appointments[idx]
}

interface Data {
  doctors: Doctor[]
  patients: Patient[]
  appointments: Appointment[]
}

// Default data for production (when file system is read-only)
const defaultData: Data = {
  doctors: [
    {
      id: 1,
      name: "Dr. Mahadoor",
      email: "mahadoor@example.com",
      phone: "+23057447700",
      licenseNumber: "LIC12345",
      specialty: "Cardiology",
      experience: 10,
      clinicAddress: "Bambous Village, Mauritius",
      availableHours: "9 AM - 5 PM",
      location: { lat: -20.256, lng: 57.406 },
      password: "password123"
      ,
      callLogs: []
    },
    {
      id: 2,
      name: "Dr. Decoy One",
      email: "decoy1@example.com",
      phone: "+23057447701",
      licenseNumber: "LIC54321",
      specialty: "General Medicine",
      experience: 5,
      clinicAddress: "Rose Hill, Mauritius",
      availableHours: "8 AM - 4 PM",
      location: { lat: -20.232, lng: 57.471 },
      password: "decoypass1"
      ,
      callLogs: []
    },
    {
      id: 3,
      name: "Dr. Decoy Two",
      email: "decoy2@example.com",
      phone: "+23057447702",
      licenseNumber: "LIC67890",
      specialty: "Pediatrics",
      experience: 7,
      clinicAddress: "Curepipe, Mauritius",
      availableHours: "10 AM - 6 PM",
      location: { lat: -20.316, lng: 57.516 },
      password: "decoypass2"
      ,
      callLogs: []
    },
    {
      id: 5,
      name: "Dr. Sahil Jeebun",
      email: "sahiljeebun132@gmail.com",
      phone: "+23058307623",
      licenseNumber: "LIC24681",
      specialty: "General Medicine",
      experience: 3,
      clinicAddress: "Mapou, Mauritius",
      availableHours: "9 AM - 3 PM",
      location: { lat: -20.0575, lng: 57.6111 }, // Mapou, North Mauritius
      password: "12qsawzx",
      callLogs: []
    },
  ],
  patients: [
    {
      id: 1,
      name: "John Smith",
      email: "john@example.com",
      phone: "+230 111 2222",
      address: "Port Louis, Mauritius",
      password: "password123"
    },
  ],
  appointments: []
}

export function logDoctorCall(doctorId: number, log: DoctorCallLog): void {
  if (isProduction) {
    // Not persisted in production
    return
  }
  const data = readData()
  const idx = data.doctors.findIndex(d => d.id === doctorId)
  if (idx === -1) return
  if (!Array.isArray(data.doctors[idx].callLogs)) data.doctors[idx].callLogs = []
  data.doctors[idx].callLogs.push(log)
  writeData(data)
}

function readData(): Data {
  if (isProduction) {
    // In production, return default data since file system is read-only
    return defaultData
  }

  try {
    if (fs.existsSync(dataPath)) {
      const fileContents = fs.readFileSync(dataPath, 'utf8')
      return JSON.parse(fileContents)
    } else {
      // If file doesn't exist, create it with default data
      writeData(defaultData)
      return defaultData
    }
  } catch (error) {
    console.error('Error reading data file:', error)
    return defaultData
  }
}

function writeData(data: Data): void {
  if (isProduction) {
    // In production, we can't write to file system
    console.log('Production mode: Data changes are not persisted')
    return
  }

  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing data file:', error)
  }
}

export function getDoctors(): Doctor[] {
  return readData().doctors
}

export function getDoctor(id: number): Doctor | undefined {
  return readData().doctors.find(doctor => doctor.id === id)
}

export function addDoctor(doctor: Omit<Doctor, 'id'>): Doctor {
  if (isProduction) {
    // In production, simulate adding doctor but don't persist
    const newId = Math.max(...defaultData.doctors.map(d => d.id), 0) + 1
    const newDoctor = { ...doctor, id: newId }
    console.log('Production mode: Doctor registration simulated (not persisted)')
    return newDoctor
  }

  const data = readData()
  const newId = Math.max(...data.doctors.map(d => d.id), 0) + 1
  const newDoctor = { ...doctor, id: newId }
  data.doctors.push(newDoctor)
  writeData(data)
  return newDoctor
}

export function getPatients(): Patient[] {
  return readData().patients
}

export function getPatient(id: number): Patient | undefined {
  return readData().patients.find(patient => patient.id === id)
}

export function addPatient(patient: Omit<Patient, 'id'>): Patient {
  if (isProduction) {
    // In production, simulate adding patient but don't persist
    const newId = Math.max(...defaultData.patients.map(p => p.id), 0) + 1
    const newPatient = { ...patient, id: newId, favoriteDoctorIds: patient.favoriteDoctorIds ?? [] }
    console.log('Production mode: Patient registration simulated (not persisted)')
    return newPatient
  }

  const data = readData()
  const newId = Math.max(...data.patients.map(p => p.id), 0) + 1
  const newPatient = { ...patient, id: newId, favoriteDoctorIds: patient.favoriteDoctorIds ?? [] }
  data.patients.push(newPatient)
  writeData(data)
  return newPatient
}

export function updatePatientFavorites(patientId: number, favoriteDoctorIds: number[]): Patient | undefined {
  if (isProduction) {
    const patient = defaultData.patients.find(p => p.id === patientId)
    if (!patient) return undefined
    return { ...patient, favoriteDoctorIds }
  }

  const data = readData()
  const patientIndex = data.patients.findIndex(p => p.id === patientId)
  if (patientIndex === -1) return undefined

  data.patients[patientIndex] = {
    ...data.patients[patientIndex],
    favoriteDoctorIds
  }
  writeData(data)
  return data.patients[patientIndex]
}

export function getAppointments(): Appointment[] {
  return readData().appointments
}

export function addAppointment(appointment: Omit<Appointment, 'id'>): Appointment {
  if (isProduction) {
    // In production, simulate adding appointment but don't persist
    const newId = Math.max(...defaultData.appointments.map(a => a.id), 0) + 1
    const newAppointment = { ...appointment, id: newId }
    console.log('Production mode: Appointment booking simulated (not persisted)')
    return newAppointment
  }

  const data = readData()
  const newId = Math.max(...data.appointments.map(a => a.id), 0) + 1
  const newAppointment = { ...appointment, id: newId }
  data.appointments.push(newAppointment)
  writeData(data)
  return newAppointment
}

export function getAllData(): Data {
  return readData()
}