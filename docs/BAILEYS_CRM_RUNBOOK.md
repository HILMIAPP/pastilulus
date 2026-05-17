# Baileys CRM Omni Runbook

Baileys runs as a separate long-lived worker. Do not run it inside a Next.js route handler because WhatsApp Web needs a persistent socket and saved auth state.

## Start

```bash
npm run wa:crm
```

On the first run, scan the QR code with the admin WhatsApp account. The session is stored in `.baileys-auth/`, which is intentionally ignored by git.

## Required env

```bash
NEXT_PUBLIC_ENABLE_BAILEYS_CRM=true
ENABLE_BAILEYS_CRM=true
SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
BAILEYS_AUTH_DIR=.baileys-auth
BAILEYS_CRM_POLL_MS=5000
```

`SUPABASE_SERVICE_ROLE_KEY` must stay server-only.

## Flow

1. Incoming WhatsApp messages are stored as `crm_conversations.source_page = "whatsapp:baileys"`.
2. Admin replies from CRM Omni are inserted as `crm_messages.sender_type = "admin"`.
3. If the conversation is a WhatsApp conversation, the reply metadata is queued:

```json
{
  "dispatch_channel": "baileys",
  "dispatch_status": "queued"
}
```

4. The worker polls queued replies and sends them through Baileys.
5. After sending, metadata becomes `dispatch_status = "sent"` or `failed`.

## Production

Run the worker with a process manager such as PM2, Docker, or a VPS service. Vercel/serverless is not suitable for the Baileys socket.
