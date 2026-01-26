import { logDoctorCall } from '@/lib/db'
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const doctorId = Number(body?.doctorId)
    const logIndex = Number(body?.logIndex)
    const report = String(body?.report || '').trim()
    if (!Number.isFinite(doctorId) || !Number.isFinite(logIndex) || !report) {
      return NextResponse.json({ error: 'Valid doctorId, logIndex, and report required' }, { status: 400 })
    }
    // Update the report in the doctor's callLogs
    const data = require('@/lib/db').readData()
    const idx = data.doctors.findIndex((d: any) => d.id === doctorId)
    if (idx === -1) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    if (!Array.isArray(data.doctors[idx].callLogs) || !data.doctors[idx].callLogs[logIndex]) {
      return NextResponse.json({ error: 'Call log not found' }, { status: 404 })
    }
    data.doctors[idx].callLogs[logIndex].report = report
    require('@/lib/db').writeData(data)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update call log report' }, { status: 500 })
  }
}
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