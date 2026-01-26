import { NextRequest, NextResponse } from 'next/server'
import { getAppointments, addAppointment, getDoctor, getPatient, Appointment, updateAppointmentReport } from '@/lib/db'
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const appointmentId = Number(body?.appointmentId)
    const report = String(body?.report || '').trim()
    if (!Number.isFinite(appointmentId) || !report) {
      return NextResponse.json({ error: 'Valid appointmentId and report required' }, { status: 400 })
    }
    const updated = updateAppointmentReport(appointmentId, report)
    if (!updated) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
  }
}
import { WebClient } from '@slack/web-api'

export async function GET() {
  try {
    const appointments = getAppointments()
    return NextResponse.json(appointments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<Appointment, 'id'> = await request.json()
    const newAppointment = addAppointment(body)

    // Send Slack notification
    const slackToken = process.env.SLACK_BOT_TOKEN
    const slackChannel = process.env.SLACK_CHANNEL_ID

    if (slackToken && slackChannel) {
      try {
        const slackClient = new WebClient(slackToken)
        const doctor = getDoctor(body.doctorId)
        const patient = getPatient(body.patientId)
        const message = `New appointment booked!\nPatient: ${patient?.name || 'Unknown'}\nDoctor: ${doctor?.name || 'Unknown'}\nDate: ${body.date}\nTime: ${body.time}\nStatus: ${body.status || 'pending'}`
        
        await slackClient.chat.postMessage({
          channel: slackChannel,
          text: message
        })
      } catch (slackError) {
        console.error('Failed to send Slack notification:', slackError)
        // Don't fail the appointment creation if Slack fails
      }
    }

    return NextResponse.json(newAppointment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add appointment' }, { status: 500 })
  }
}