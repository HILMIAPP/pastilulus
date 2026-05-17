import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import makeWASocket, { DisconnectReason, useMultiFileAuthState as createBaileysAuthState } from "@whiskeysockets/baileys";
import { createClient } from "@supabase/supabase-js";
import pino from "pino";
import qrcode from "qrcode-terminal";

const rootDir = process.cwd();
const authDir = process.env.BAILEYS_AUTH_DIR || path.join(rootDir, ".baileys-auth");
const pollMs = Number(process.env.BAILEYS_CRM_POLL_MS || 5000);
const logger = pino({ level: process.env.BAILEYS_LOG_LEVEL || "warn" });

function loadLocalEnv(fileName) {
  const filePath = path.join(rootDir, fileName);
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (process.env[key]) continue;
    process.env[key] = valueParts.join("=").replace(/^['"]|['"]$/g, "");
  }
}

loadLocalEnv(".env.local");
loadLocalEnv(".env");

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalizePhone(phone = "") {
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return digits;
}

function jidFromPhone(phone) {
  const normalized = normalizePhone(phone);
  return normalized ? `${normalized}@s.whatsapp.net` : "";
}

function phoneFromJid(jid = "") {
  return jid.split("@")[0]?.replace(/\D/g, "") || "";
}

function extractText(message) {
  const content = message.message;
  if (!content) return "";
  return (
    content.conversation ||
    content.extendedTextMessage?.text ||
    content.imageMessage?.caption ||
    content.videoMessage?.caption ||
    content.documentMessage?.caption ||
    content.buttonsResponseMessage?.selectedDisplayText ||
    content.listResponseMessage?.title ||
    ""
  ).trim();
}

async function findOrCreateConversation(phone, firstMessage) {
  const { data: existing, error: findError } = await supabase
    .from("crm_conversations")
    .select("id")
    .eq("visitor_phone", phone)
    .ilike("source_page", "whatsapp:%")
    .neq("status", "closed")
    .order("last_message_at", { ascending: false })
    .limit(1);

  if (findError) throw findError;
  if (existing?.[0]?.id) return existing[0].id;

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("crm_conversations")
    .insert({
      visitor_name: `WA ${phone}`,
      visitor_phone: phone,
      source_page: "whatsapp:baileys",
      topic: "whatsapp",
      status: "waiting_admin",
      last_message_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error) throw error;
  console.log(`New WhatsApp conversation ${data.id}: ${firstMessage.slice(0, 80)}`);
  return data.id;
}

async function storeInboundMessage(message) {
  if (message.key.fromMe || !message.key.remoteJid?.endsWith("@s.whatsapp.net")) return;

  const body = extractText(message);
  if (!body) return;

  const waMessageId = message.key.id;
  if (waMessageId) {
    const { data: duplicate } = await supabase
      .from("crm_messages")
      .select("id")
      .filter("metadata->>wa_message_id", "eq", waMessageId)
      .limit(1);
    if (duplicate?.length) return;
  }

  const phone = phoneFromJid(message.key.remoteJid);
  const conversationId = await findOrCreateConversation(phone, body);
  const now = new Date().toISOString();

  const { error: messageError } = await supabase.from("crm_messages").insert({
    conversation_id: conversationId,
    sender_type: "visitor",
    body,
    metadata: {
      source: "baileys_inbound",
      wa_jid: message.key.remoteJid,
      wa_message_id: waMessageId,
    },
  });
  if (messageError) throw messageError;

  const { error: updateError } = await supabase
    .from("crm_conversations")
    .update({ status: "waiting_admin", last_message_at: now, updated_at: now })
    .eq("id", conversationId);
  if (updateError) throw updateError;
}

async function dispatchQueuedReplies(sock) {
  const { data, error } = await supabase
    .from("crm_messages")
    .select("id,body,metadata,crm_conversations!inner(id,visitor_phone,source_page)")
    .eq("sender_type", "admin")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("Failed to load queued WhatsApp replies:", error.message);
    return;
  }

  const queued = (data ?? []).filter((message) => {
    const metadata = message.metadata || {};
    const sourcePage = message.crm_conversations?.source_page || "";
    return metadata.dispatch_channel === "baileys" && metadata.dispatch_status === "queued" && sourcePage.includes("whatsapp");
  });

  for (const message of queued) {
    const jid = jidFromPhone(message.crm_conversations?.visitor_phone);
    if (!jid) continue;

    try {
      const sent = await sock.sendMessage(jid, { text: message.body });
      await supabase
        .from("crm_messages")
        .update({
          metadata: {
            ...(message.metadata || {}),
            dispatch_status: "sent",
            sent_at: new Date().toISOString(),
            wa_jid: jid,
            wa_message_id: sent?.key?.id,
          },
        })
        .eq("id", message.id);
      console.log(`Sent WhatsApp reply to ${jid}`);
    } catch (sendError) {
      await supabase
        .from("crm_messages")
        .update({
          metadata: {
            ...(message.metadata || {}),
            dispatch_status: "failed",
            failed_at: new Date().toISOString(),
            error: sendError instanceof Error ? sendError.message : String(sendError),
          },
        })
        .eq("id", message.id);
      console.error(`Failed to send WhatsApp reply ${message.id}:`, sendError);
    }
  }
}

async function connect() {
  const { state, saveCreds } = await createBaileysAuthState(authDir);
  const sock = makeWASocket({
    auth: state,
    logger,
    markOnlineOnConnect: false,
    syncFullHistory: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log("Scan QR berikut dengan WhatsApp admin:");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "open") {
      console.log("Baileys CRM worker connected.");
    }
    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`Baileys disconnected. reconnect=${shouldReconnect}`);
      if (shouldReconnect) void connect();
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const message of messages) {
      try {
        await storeInboundMessage(message);
      } catch (error) {
        console.error("Failed to store inbound WhatsApp message:", error);
      }
    }
  });

  setInterval(() => {
    void dispatchQueuedReplies(sock);
  }, pollMs);
}

void connect();
