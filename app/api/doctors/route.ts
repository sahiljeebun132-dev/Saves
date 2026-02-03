import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Doctor from '@/lib/models/Doctor';
import { addDoctor, getDoctors } from '@/lib/db'

// PATCH: Update a doctor's call log report
export async function PATCH(request: NextRequest) {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  await dbConnect();
  try {
    const body = await request.json();
    const doctorId = body?.doctorId;
    const logIndex = body?.logIndex;
    const report = String(body?.report || '').trim();
    if (!doctorId || logIndex === undefined || !report) {
      return NextResponse.json({ error: 'Valid doctorId, logIndex, and report required' }, { status: 400 });
    }
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    if (!Array.isArray(doctor.callLogs) || !doctor.callLogs[logIndex]) {
      return NextResponse.json({ error: 'Call log not found' }, { status: 404 });
    }
    doctor.callLogs[logIndex].report = report;
    await doctor.save();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update call log report' }, { status: 500 });
  }
}

// GET: Fetch all doctors
export async function GET() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    return NextResponse.json(getDoctors())
  }

  try {
    const db = await dbConnect();
    if (!db || !db.connection || db.connection.readyState !== 1) {
      return NextResponse.json(getDoctors())
    }
  } catch {
    return NextResponse.json(getDoctors())
  }
  try {
    const doctors = await Doctor.find();
    if (!doctors || doctors.length === 0) {
      return NextResponse.json(getDoctors())
    }
    return NextResponse.json(doctors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}

// POST: Add a new doctor
export async function POST(request: NextRequest) {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    const body = await request.json();
    const created = addDoctor(body)
    return NextResponse.json(created, { status: 201 })
  }

  await dbConnect();
  try {
    const body = await request.json();
    const newDoctor = await Doctor.create(body);
    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add doctor' }, { status: 500 });
  }
}