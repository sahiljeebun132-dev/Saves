import { NextRequest, NextResponse } from 'next/server'
import { getPatients, addPatient, updatePatientFavorites, Patient } from '@/lib/db'

export async function GET() {
  try {
    const patients = getPatients()
    return NextResponse.json(patients)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<Patient, 'id'> = await request.json()
    const newPatient = addPatient(body)
    return NextResponse.json(newPatient, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add patient' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const patientId = Number(body?.patientId)
    const favoriteDoctorIds = Array.isArray(body?.favoriteDoctorIds)
      ? body.favoriteDoctorIds.filter((id: unknown) => Number.isFinite(id))
      : []

    if (!Number.isFinite(patientId)) {
      return NextResponse.json({ error: 'Valid patientId required' }, { status: 400 })
    }

    const updated = updatePatientFavorites(patientId, favoriteDoctorIds)
    if (!updated) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update favorites' }, { status: 500 })
  }
}