// Simple Twilio message inspector
require('dotenv').config({ path: '.env.local' })
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

if (!accountSid || !authToken) {
  console.error('TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set in .env.local')
  process.exit(1)
}

const client = require('twilio')(accountSid, authToken)

async function listMessages() {
  try {
    const messages = await client.messages.list({ limit: 50 })
    console.log(`Found ${messages.length} messages:`)
    for (const m of messages) {
      console.log('---')
      console.log('SID:', m.sid)
      console.log('DateSent:', m.dateSent)
      console.log('From:', m.from)
      console.log('To:', m.to)
      console.log('Status:', m.status)
      console.log('Direction:', m.direction)
      const body = (m.body || '').replace(/\n/g, ' ')
      console.log('Body:', body.substring(0, 300))
    }
  } catch (err) {
    console.error('Error fetching messages:', err.message || err)
    process.exit(2)
  }
}

listMessages()
