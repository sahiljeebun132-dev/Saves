// Fetch message by SID
require('dotenv').config({ path: '.env.local' })
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

if (!accountSid || !authToken) {
  console.error('Credentials not set')
  process.exit(1)
}

const client = require('twilio')(accountSid, authToken)

const sid = process.argv[2] || 'SM87f27a32a5cc55b23e4a18aa08c60a2a'

client.messages(sid).fetch()
  .then(message => {
    console.log('SID:', message.sid)
    console.log('Status:', message.status)
    console.log('To:', message.to)
    console.log('From:', message.from)
    console.log('DateSent:', message.dateSent)
    console.log('ErrorCode:', message.errorCode)
    console.log('ErrorMessage:', message.errorMessage)
    console.log('Body:', message.body.substring(0, 100))
  })
  .catch(error => {
    console.error('Error fetching message:', error.message)
  })