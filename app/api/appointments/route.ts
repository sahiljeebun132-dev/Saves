import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/lib/models/Appointment';
import Doctor from '@/lib/models/Doctor';
import Patient from '@/lib/models/Patient';
export async function PATCH(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const appointmentId = body?.appointmentId;
    const report = String(body?.report || '').trim();
    if (!appointmentId || !report) {
      return NextResponse.json({ error: 'Valid appointmentId and report required' }, { status: 400 });
    }
    const updated = await Appointment.findByIdAndUpdate(
      appointmentId,
      { report },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
import { WebClient } from '@slack/web-api'

export async function GET() {
  await dbConnect();
  try {
    const appointments = await Appointment.find();
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const newAppointment = await Appointment.create(body);

    // Send Slack notification
    const slackToken = process.env.SLACK_BOT_TOKEN;
    const slackChannel = process.env.SLACK_CHANNEL_ID;

    if (slackToken && slackChannel) {
      try {
        const slackClient = new WebClient(slackToken);
        const doctor = await Doctor.findById(body.doctorId);
        const patient = await Patient.findById(body.patientId);
        const message = `New appointment booked!\nPatient: ${patient?.name || 'Unknown'}\nDoctor: ${doctor?.name || 'Unknown'}\nDate: ${body.date}\nTime: ${body.time}\nStatus: ${body.status || 'pending'}`;

        await slackClient.chat.postMessage({
          channel: slackChannel,
          text: message
        });
      } catch (slackError) {
        console.error('Failed to send Slack notification:', slackError);
        // Don't fail the appointment creation if Slack fails
      }
    }

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add appointment' }, { status: 500 });
  }
}