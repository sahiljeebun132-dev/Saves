import { NextRequest, NextResponse } from 'next/server'
import { WebClient } from '@slack/web-api'

const slackToken = process.env.SLACK_BOT_TOKEN

async function parseSlackBody(request: NextRequest): Promise<any> {
  const contentType = request.headers.get('content-type') || ''
  const raw = await request.text()

  if (contentType.includes('application/json')) {
    return raw ? JSON.parse(raw) : {}
  }

  // Slack interactive components / slash commands typically send urlencoded bodies.
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(raw)
    const payload = params.get('payload')
    if (payload) {
      return JSON.parse(payload)
    }
    const obj: Record<string, string> = {}
    params.forEach((value, key) => {
      obj[key] = value
    })
    return obj
  }

  // Fallback: try JSON, else return raw.
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    return { raw }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseSlackBody(request)

    // Slack Events API URL Verification
    // Slack expects a JSON body containing the challenge.
    if (body?.type === 'url_verification' && body?.challenge) {
      return NextResponse.json({ challenge: String(body.challenge) })
    }

    // Acknowledge events quickly; process asynchronously.
    if (body?.event && body.event.type === 'message' && !body.event.bot_id) {
      const message = body.event.text
      const user = body.event.user
      const channel = body.event.channel
      console.log(`Received message from ${user} in ${channel}: ${message}`)

      if (slackToken) {
        const slackClient = new WebClient(slackToken)
        void slackClient.chat.postMessage({
          channel,
          text: `Received your message: ${message}`
        }).catch((err: any) => {
          console.error('Failed to post Slack reply:', err?.data || err?.message || err)
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error in Slack webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  // Helpful for quickly checking the route is deployed and reachable.
  return NextResponse.json({ ok: true })
}