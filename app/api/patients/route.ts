
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Patient from '@/lib/models/Patient';


export async function GET() {
  await dbConnect();
  try {
    const patients = await Patient.find();
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const newPatient = await Patient.create(body);
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add patient' }, { status: 500 });
  }
}


export async function PATCH(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const patientId = body?.patientId;
    const favoriteDoctorIds = Array.isArray(body?.favoriteDoctorIds)
      ? body.favoriteDoctorIds.filter((id: unknown) => typeof id === 'string' || typeof id === 'object')
      : [];

    if (!patientId) {
      return NextResponse.json({ error: 'Valid patientId required' }, { status: 400 });
    }

    const updated = await Patient.findByIdAndUpdate(
      patientId,
      { favoriteDoctorIds },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update favorites' }, { status: 500 });
  }
}