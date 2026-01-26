# Doctor Direct

A Next.js web application for online doctor appointment booking.

## Features

- Book appointments with doctors
- View closest doctors first based on location
- Estimated appointment wait times
- Mandatory registration forms for patients and doctors
- Responsive design with Tailwind CSS

## Getting Started

First, ensure Node.js is installed. Then install dependencies:

```bash
npm ci
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

Note: this project sets `PORT=3001` in `npm run dev`.

## Restore After a PC Reset (Windows)

This repo is already set up to be portable. After reinstalling Windows + VS Code:

1. Install Node.js (recommended: Node 20 LTS). This repo includes `.nvmrc`.
2. Clone your repo (or copy your backed-up DoctorDirect folder) onto the new PC.
3. In VS Code, open the folder and run:
   ```bash
   npm ci
   ```
4. Create your local secrets file:
   - Copy `.env.example` to `.env.local`
   - Fill in the values (Slack/Twilio are optional)
5. Start the server:
   - VS Code Task: **Run Development Server** (or run `npm run dev`)
6. Visit: `http://localhost:3001`

Important: `.env.local` is intentionally NOT committed. Back up your secrets separately (password manager / secure notes).
## Backup Checklist (What GitHub Does/Doesn’t Save)

GitHub already backs up all committed project files (code, config, `package-lock.json`, `.vscode/*`, etc.).

You still need to back up these separately:

- **Secrets**: the values inside `.env.local` (Slack/Twilio tokens). Do **not** commit `.env.local`.
- **Optional local data**: if you care about keeping your local registrations/appointments, back up `data.json` too.
   - Note: `data.json` is currently tracked by git in this repo. If you want it to be *purely local*, tell me and I can update `.gitignore`.
>>>>>>> 74c78df (Update project files before redeploying to Vercel)

## Project Structure

- `app/` - Next.js app directory with pages
- `app/page.tsx` - Home page
- `app/book/page.tsx` - Doctor listing and booking page
- `app/book/[id]/page.tsx` - Individual doctor booking form
- `app/register/patient/page.tsx` - Patient registration
- `app/register/doctor/page.tsx` - Doctor registration

## Slack Notifications

The application integrates with Slack to send notifications for new appointment bookings and emergency calls.

### Setup Instructions

1. Create a new Slack app at [https://api.slack.com/apps](https://api.slack.com/apps).

2. Add the following bot token scopes:
   - `chat:write` (to send messages)
   - `channels:read` (if needed)
   - `im:read` (for DMs, if receiving messages)

3. Install the app to your workspace and get the Bot User OAuth Token.

4. Get the Channel ID for the channel where you want to send notifications (e.g., #general). You can get it by right-clicking the channel in Slack and selecting "Copy link", the ID is the last part.

5. For receiving messages (optional), enable Event Subscriptions:
   - Subscribe to bot events: `message.channels`, `message.im`, etc.
   - Set the Request URL to your deployed app's `/api/slack/webhook` (e.g., `https://yourdomain.com/api/slack/webhook`)
   - Get the Signing Secret from the app settings.

6. Update `.env.local` with your Slack credentials (recommended workflow: copy from `.env.example`):
   ```
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   SLACK_CHANNEL_ID=C1234567890
   SLACK_SIGNING_SECRET=your-signing-secret  # For webhook verification
   ```

7. Redeploy the application or restart the local server.

When a patient books an appointment or calls for emergency, a Slack message will be sent to the specified channel.