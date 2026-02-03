import { NextRequest, NextResponse } from 'next/server'
import { WebClient } from '@slack/web-api'
import dbConnect from '@/lib/mongodb';
import Doctor from '@/lib/models/Doctor';
import { getDoctors, logDoctorCall } from '@/lib/db'

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

function normalizeLocation(doctor: any): { lat: number; lng: number } | null {
  if (doctor?.location && Number.isFinite(doctor.location.lat) && Number.isFinite(doctor.location.lng)) {
    return { lat: Number(doctor.location.lat), lng: Number(doctor.location.lng) }
  }

  if (Number.isFinite(doctor?.lat) && Number.isFinite(doctor?.lng)) {
    return { lat: Number(doctor.lat), lng: Number(doctor.lng) }
  }

  return null
}

function getNearestDoctorsFromList(doctors: any[], lat: number, lng: number) {
  return doctors
    .map((doctor) => {
      const loc = normalizeLocation(doctor)
      if (!loc) return null
      return {
        ...doctor,
        location: loc,
        distance: haversineDistance(lat, lng, loc.lat, loc.lng)
      }
    })
    .filter(Boolean)
    .sort((a, b) => (a as any).distance - (b as any).distance)
    .slice(0, 3) as any[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lat = Number(body?.lat);
    const lng = Number(body?.lng);
    const name = body?.name;
    const phone = body?.phone;
    const mode = body?.mode;
    const isDirectMode = mode === 'direct';
    console.log('[CALL-DOCTOR] Incoming call:', { lat, lng, name, phone, mode });

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.error('[CALL-DOCTOR] Invalid lat/lng:', lat, lng);
      return NextResponse.json({ error: 'Valid lat/lng location required' }, { status: 400 });
    }

    const mongoUri = process.env.MONGODB_URI

    if (!mongoUri) {
      console.warn('[CALL-DOCTOR] MONGODB_URI not set. Falling back to file-based data.');
      const doctors = getDoctors();
      const nearestDoctors = getNearestDoctorsFromList(doctors, lat, lng);

      if (nearestDoctors.length > 0) {
        const selectedDoctor = nearestDoctors[0];
        logDoctorCall(selectedDoctor.id, {
          timestamp: new Date().toISOString(),
          patientName: name,
          patientPhone: phone,
          location: { lat, lng }
        });
      } else {
        return NextResponse.json({ error: 'No nearest doctors found' }, { status: 404 });
      }

      return NextResponse.json({ doctors: nearestDoctors });
    }

    let db: any = null
    try {
      db = await dbConnect();
    } catch (error) {
      console.error('[CALL-DOCTOR] MongoDB connection error:', error);
    }

    if (!db || !db.connection || db.connection.readyState !== 1) {
      console.warn('[CALL-DOCTOR] MongoDB unavailable. Falling back to file-based data.');
      const doctors = getDoctors();
      const nearestDoctors = getNearestDoctorsFromList(doctors, lat, lng);

      if (nearestDoctors.length > 0) {
        const selectedDoctor = nearestDoctors[0];
        logDoctorCall(selectedDoctor.id, {
          timestamp: new Date().toISOString(),
          patientName: name,
          patientPhone: phone,
          location: { lat, lng }
        });
      } else {
        return NextResponse.json({ error: 'No nearest doctors found' }, { status: 404 });
      }

      return NextResponse.json({ doctors: nearestDoctors });
    }

    console.log('[CALL-DOCTOR] MongoDB connected');

    const doctors = await Doctor.find();
    console.log('[CALL-DOCTOR] Doctors in DB:', doctors.map(d => ({ _id: d._id, name: d.name, location: d.location })));
    // Calculate distances and sort
    let nearestDoctors = getNearestDoctorsFromList(doctors.map(d => d.toObject()), lat, lng);
    if (nearestDoctors.length === 0) {
      console.warn('[CALL-DOCTOR] No usable Mongo doctors. Falling back to file-based data.');
      const fallbackDoctors = getDoctors();
      nearestDoctors = getNearestDoctorsFromList(fallbackDoctors, lat, lng);
    }
    console.log('[CALL-DOCTOR] Nearest doctors:', nearestDoctors.map(d => ({ _id: d._id, name: d.name, distance: d.distance })));

    // Log call to the closest doctor (first in list)
    if (nearestDoctors.length > 0) {
      const selectedDoctorId = nearestDoctors[0]._id;
      console.log('[CALL-DOCTOR] Selected doctor _id:', selectedDoctorId);
      const doc = await Doctor.findById(selectedDoctorId);
      if (doc) {
        doc.callLogs = doc.callLogs || [];
        const newLog = {
          timestamp: new Date().toISOString(),
          patientName: name,
          patientPhone: phone,
          location: { lat, lng }
        };
        doc.callLogs.push(newLog);
        const saved = await doc.save();
        if (!saved) {
          console.error('[CALL-DOCTOR] Failed to save call log for doctor:', doc._id, doc.name);
          return NextResponse.json({ error: 'Failed to save call log' }, { status: 500 });
        }
        console.log('[CALL-DOCTOR] Saved call log for doctor:', doc._id, doc.name, newLog);
      } else {
        console.error('[CALL-DOCTOR] Doctor not found by _id:', selectedDoctorId);
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      }
    } else {
      console.error('[CALL-DOCTOR] No nearest doctors found for location:', lat, lng);
      return NextResponse.json({ error: 'No nearest doctors found' }, { status: 404 });
    }

    // Send Slack message (if Slack is configured and not in direct-call mode).
    if (!isDirectMode && slackClient && slackChannel) {
      // Build caller info and map link
      const callerName = name && String(name).trim() ? String(name).trim() : 'Unknown';
      const callerPhone = phone && String(phone).trim() ? String(phone).trim() : 'Unknown';
      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(lat))},${encodeURIComponent(String(lng))}`;

      const messageBody = `🚨 EMERGENCY CALL: Patient needs immediate medical assistance!\n\nName: ${callerName}\nPhone: ${callerPhone}\nLocation: ${lat}, ${lng}\nMap: ${mapsLink}\n\nNearest Doctors:\n${nearestDoctors.map(d => `- ${d.name} (${d.distance.toFixed(2)} km away)`).join('\n')}\n\nPlease respond urgently to this emergency call.`;

      try {
        await slackClient.chat.postMessage({
          channel: slackChannel,
          text: messageBody
        });
        console.log(`Slack message sent to channel ${slackChannel}`);
      } catch (error: any) {
        console.error('Failed to send Slack message:', error.message || error);
      }
    } else {
      console.log('Slack not configured - skipping Slack notifications');
    }

    return NextResponse.json({ doctors: nearestDoctors });
  } catch (error) {
    console.error('Error in call-doctor API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}