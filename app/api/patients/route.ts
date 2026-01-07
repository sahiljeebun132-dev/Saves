import { NextRequest, NextResponse } from 'next/server'
import { getPatients, addPatient, Patient } from '@/lib/db'

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