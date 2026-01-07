import { NextRequest, NextResponse } from 'next/server'
import { getPatients } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const patients = getPatients()
    const patient = patients.find(p => p.email === email && p.password === password)
    if (patient) {
      return NextResponse.json(patient)
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}