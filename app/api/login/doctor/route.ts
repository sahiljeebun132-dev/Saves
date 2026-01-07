import { NextRequest, NextResponse } from 'next/server'
import { getDoctors } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const doctors = getDoctors()
    const doctor = doctors.find(d => d.email === email && d.password === password)
    if (doctor) {
      return NextResponse.json(doctor)
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}