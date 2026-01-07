// Test Slack notification script
require('dotenv').config({ path: '.env.local' })
const { WebClient } = require('@slack/web-api')

const slackToken = process.env.SLACK_BOT_TOKEN
const slackChannel = process.env.SLACK_CHANNEL_ID

if (!slackToken || !slackChannel) {
  console.error('SLACK_BOT_TOKEN or SLACK_CHANNEL_ID not set in .env.local')
  process.exit(1)
}

const slackClient = new WebClient(slackToken)

async function sendTestMessage() {
  try {
    const result = await slackClient.chat.postMessage({
      channel: slackChannel,
      text: '🚨 Test message from DoctorDirect integration! If you see this, your bot and channel are set up correctly.'
    })
    console.log('Message sent:', result.ts)
  } catch (err) {
    console.error('Failed to send Slack message:', err.data || err.message || err)
    process.exit(2)
  }
}

sendTestMessage()
