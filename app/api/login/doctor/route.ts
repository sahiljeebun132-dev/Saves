import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Doctor from '@/lib/models/Doctor'

export async function POST(request: NextRequest) {
  await dbConnect()
  try {
    const { email, password } = await request.json()
    const doctor = await Doctor.findOne({ email, password })
    if (doctor) {
      return NextResponse.json(doctor)
    }
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}