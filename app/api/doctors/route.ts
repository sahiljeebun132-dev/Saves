import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Doctor from '@/lib/models/Doctor';

// PATCH: Update a doctor's call log report
export async function PATCH(request: NextRequest) {
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
  await dbConnect();
  try {
    const doctors = await Doctor.find();
    return NextResponse.json(doctors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}

// POST: Add a new doctor
export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const newDoctor = await Doctor.create(body);
    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add doctor' }, { status: 500 });
  }
}