import { NextRequest, NextResponse } from 'next/server'
import { WebClient } from '@slack/web-api'
import { getDoctors, logDoctorCall } from '../../../lib/db'

const slackToken = process.env.SLACK_BOT_TOKEN
const slackChannel = process.env.SLACK_CHANNEL_ID

let slackClient: WebClient | null = null
if (slackToken) {
  slackClient = new WebClient(slackToken)
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const lat = Number(body?.lat)
    const lng = Number(body?.lng)
    const name = body?.name
    const phone = body?.phone
    const mode = body?.mode
    const isDirectMode = mode === 'direct'

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: 'Valid lat/lng location required' }, { status: 400 })
    }

    const doctors = getDoctors()

    // Calculate distances and sort
    const doctorsWithDistance = doctors.map(doctor => ({
      ...doctor,
      distance: haversineDistance(lat, lng, doctor.location.lat, doctor.location.lng)
    })).sort((a, b) => a.distance - b.distance)

    // Get top 3 nearest doctors
    const nearestDoctors = doctorsWithDistance.slice(0, 3)

    // Log call to the closest doctor (first in list)
    if (nearestDoctors.length > 0) {
      logDoctorCall(nearestDoctors[0].id, {
        timestamp: new Date().toISOString(),
        patientName: name,
        patientPhone: phone,
        location: { lat, lng }
      })
    }

    // Send Slack message (if Slack is configured and not in direct-call mode).
    if (!isDirectMode && slackClient && slackChannel) {
      // Build caller info and map link
      const callerName = name && String(name).trim() ? String(name).trim() : 'Unknown'
      const callerPhone = phone && String(phone).trim() ? String(phone).trim() : 'Unknown'
      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(lat))},${encodeURIComponent(String(lng))}`

      const messageBody = `🚨 EMERGENCY CALL: Patient needs immediate medical assistance!\n\nName: ${callerName}\nPhone: ${callerPhone}\nLocation: ${lat}, ${lng}\nMap: ${mapsLink}\n\nNearest Doctors:\n${nearestDoctors.map(d => `- ${d.name} (${d.distance.toFixed(2)} km away)`).join('\n')}\n\nPlease respond urgently to this emergency call.`

      try {
        await slackClient.chat.postMessage({
          channel: slackChannel,
          text: messageBody
        })
        console.log(`Slack message sent to channel ${slackChannel}`)
      } catch (error: any) {
        console.error('Failed to send Slack message:', error.message || error)
      }
    } else {
      console.log('Slack not configured - skipping Slack notifications')
    }

    return NextResponse.json({ doctors: nearestDoctors })
  } catch (error) {
    console.error('Error in call-doctor API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}