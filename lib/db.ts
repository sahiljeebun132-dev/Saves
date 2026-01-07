import fs from 'fs'
import path from 'path'

// Use environment variable to determine if we're in production
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'

const dataPath = path.join(process.cwd(), 'data.json')

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
}

export interface Patient {
  id: number
  name: string
  email: string
  phone: string
  address: string
  password: string
}

export interface Appointment {
  id: number
  doctorId: number
  patientId: number
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
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
      phone: "+230 123 4567",
      licenseNumber: "LIC12345",
      specialty: "Cardiology",
      experience: 10,
      clinicAddress: "Bambous Village, Mauritius",
      availableHours: "9 AM - 5 PM",
      location: { lat: -20.256, lng: 57.406 },
      password: "password123"
    },
    {
      id: 2,
      name: "Dr. Jane Doe",
      email: "jane@example.com",
      phone: "+230 234 5678",
      licenseNumber: "LIC23456",
      specialty: "Dermatology",
      experience: 8,
      clinicAddress: "Port Louis, Mauritius",
      availableHours: "10 AM - 6 PM",
      location: { lat: -20.165, lng: 57.501 },
      password: "password123"
    },
    {
      id: 3,
      name: "Dr. Bob Johnson",
      email: "bob@example.com",
      phone: "+230 345 6789",
      licenseNumber: "LIC34567",
      specialty: "Pediatrics",
      experience: 12,
      clinicAddress: "Curepipe, Mauritius",
      availableHours: "8 AM - 4 PM",
      location: { lat: -20.348, lng: 57.552 },
      password: "password123"
    },
    {
      id: 4,
      name: "Dr. Alice Brown",
      email: "alice@example.com",
      phone: "+230 456 7890",
      licenseNumber: "LIC45678",
      specialty: "Neurology",
      experience: 15,
      clinicAddress: "Quatre Bornes, Mauritius",
      availableHours: "9 AM - 5 PM",
      location: { lat: -20.244, lng: 57.478 },
      password: "password123"
    }
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
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+230 333 4444",
      address: "Curepipe, Mauritius",
      password: "password123"
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike@example.com",
      phone: "+230 555 6666",
      address: "Quatre Bornes, Mauritius",
      password: "password123"
    }
  ],
  appointments: []
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
    const newPatient = { ...patient, id: newId }
    console.log('Production mode: Patient registration simulated (not persisted)')
    return newPatient
  }

  const data = readData()
  const newId = Math.max(...data.patients.map(p => p.id), 0) + 1
  const newPatient = { ...patient, id: newId }
  data.patients.push(newPatient)
  writeData(data)
  return newPatient
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