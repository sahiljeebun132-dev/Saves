import { NextRequest, NextResponse } from 'next/server'
import { getDoctors, addDoctor, Doctor } from '@/lib/db'

export async function GET() {
  try {
    const doctors = getDoctors()
    return NextResponse.json(doctors)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<Doctor, 'id'> = await request.json()
    const newDoctor = addDoctor(body)
    return NextResponse.json(newDoctor, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add doctor' }, { status: 500 })
  }
}