import { createHmac } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import http from "node:http";
import sharp from "sharp";

const chromePath = "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe";
const outDir = "public/tutorial";
const frameDir = `${outDir}/payment-gif-frames`;
const gifPath = `${outDir}/tutorial-pembelian.gif`;
const port = 9333;
const baseUrl = "http://127.0.0.1:3000";
const width = 960;
const height = 675;

function requestJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

function toBase64Url(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function encodeSession() {
  const session = {
    userId: "gif-demo-user",
    name: "shafwan",
    email: "demo@pastilulus.local",
    role: "student",
    tier: "belajar",
    createdAt: Date.now(),
  };
  const payload = toBase64Url(JSON.stringify(session));
  const signature = createHmac("sha256", process.env.AUTH_SECRET ?? "dev-only-change-me-before-production")
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

async function startChrome() {
  const profileDir = "C:/tmp/pastilulus-payment-gif-chrome";
  await rm(profileDir, { recursive: true, force: true });
  const child = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--remote-allow-origins=*",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    `--window-size=${width},${height}`,
    "--hide-scrollbars",
    "about:blank",
  ], { stdio: "ignore", windowsHide: true });

  for (let i = 0; i < 40; i += 1) {
    try {
      await requestJson(`http://127.0.0.1:${port}/json/version`);
      const targets = await requestJson(`http://127.0.0.1:${port}/json/list`);
      const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
      if (page?.webSocketDebuggerUrl) return { child, wsUrl: page.webSocketDebuggerUrl };
    } catch {}
    await delay(250);
  }
  child.kill();
  throw new Error("Chrome remote debugging did not start.");
}

function connectCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();

  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(new Error(data.error.message));
      else resolve(data.result ?? {});
    }
  });

  const opened = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  return {
    async send(method, params = {}) {
      await opened;
      id += 1;
      ws.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    },
    close() {
      ws.close();
    },
  };
}

async function waitForLoad(client) {
  await client.send("Runtime.evaluate", {
    expression: "new Promise(resolve => { if (document.readyState === 'complete') resolve(true); else window.addEventListener('load', () => resolve(true), { once: true }); })",
    awaitPromise: true,
  });
  await delay(700);
}

async function addCaption(client, text) {
  const safeText = JSON.stringify(text);
  await client.send("Runtime.evaluate", {
    expression: `
      (() => {
        document.querySelectorAll('[data-gif-caption]').forEach((el) => el.remove());
        const el = document.createElement('div');
        el.dataset.gifCaption = 'true';
        el.textContent = ${safeText};
        Object.assign(el.style, {
          position: 'fixed',
          left: '24px',
          bottom: '24px',
          zIndex: '999999',
          maxWidth: '520px',
          borderRadius: '18px',
          background: 'rgba(15, 23, 42, 0.94)',
          color: 'white',
          padding: '14px 18px',
          font: '800 18px/1.35 Inter, Arial, sans-serif',
          boxShadow: '0 20px 50px rgba(15,23,42,.28)'
        });
        document.body.appendChild(el);
      })()
    `,
  });
}

async function capture(client, index, url, caption, scrollY = 0) {
  await client.send("Page.navigate", { url });
  await waitForLoad(client);
  if (scrollY > 0) {
    await client.send("Runtime.evaluate", { expression: `window.scrollTo({ top: ${scrollY}, behavior: 'instant' })` });
    await delay(500);
  }
  await addCaption(client, caption);
  const { data } = await client.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const framePath = `${frameDir}/frame-${String(index).padStart(2, "0")}.png`;
  await writeFile(framePath, Buffer.from(data, "base64"));
  return framePath;
}

function paletteColor(index) {
  const r = ((index >> 5) & 7) * 255 / 7;
  const g = ((index >> 2) & 7) * 255 / 7;
  const b = (index & 3) * 255 / 3;
  return [Math.round(r), Math.round(g), Math.round(b)];
}

function mapToPalette(r, g, b) {
  const ri = Math.round((r / 255) * 7);
  const gi = Math.round((g / 255) * 7);
  const bi = Math.round((b / 255) * 3);
  return (ri << 5) | (gi << 2) | bi;
}

function writeSubBlocks(bytes) {
  const chunks = [];
  for (let i = 0; i < bytes.length; i += 255) {
    const slice = bytes.slice(i, i + 255);
    chunks.push(Buffer.from([slice.length]), Buffer.from(slice));
  }
  chunks.push(Buffer.from([0]));
  return Buffer.concat(chunks);
}

function lzwEncode(indices) {
  const minCodeSize = 8;
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let nextCode = endCode + 1;
  let codeSize = minCodeSize + 1;
  const dict = new Map();
  for (let i = 0; i < clearCode; i += 1) dict.set(String(i), i);

  const out = [];
  let bitBuffer = 0;
  let bitCount = 0;
  const emit = (code) => {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      out.push(bitBuffer & 255);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  };

  emit(clearCode);
  let phrase = String(indices[0]);
  for (let i = 1; i < indices.length; i += 1) {
    const current = String(indices[i]);
    const combo = `${phrase},${current}`;
    if (dict.has(combo)) {
      phrase = combo;
    } else {
      emit(dict.get(phrase));
      if (nextCode < 4096) {
        dict.set(combo, nextCode);
        nextCode += 1;
        if (nextCode === (1 << codeSize) && codeSize < 12) codeSize += 1;
      } else {
        emit(clearCode);
        dict.clear();
        for (let j = 0; j < clearCode; j += 1) dict.set(String(j), j);
        nextCode = endCode + 1;
        codeSize = minCodeSize + 1;
      }
      phrase = current;
    }
  }
  emit(dict.get(phrase));
  emit(endCode);
  if (bitCount > 0) out.push(bitBuffer & 255);
  return Buffer.concat([Buffer.from([minCodeSize]), writeSubBlocks(Buffer.from(out))]);
}

async function makeGif(framePaths) {
  const header = [];
  header.push(Buffer.from("GIF89a", "ascii"));
  const logical = Buffer.alloc(7);
  logical.writeUInt16LE(width, 0);
  logical.writeUInt16LE(height, 2);
  logical[4] = 0xf7;
  logical[5] = 0;
  logical[6] = 0;
  header.push(logical);
  const palette = Buffer.alloc(256 * 3);
  for (let i = 0; i < 256; i += 1) {
    const [r, g, b] = paletteColor(i);
    palette[i * 3] = r;
    palette[i * 3 + 1] = g;
    palette[i * 3 + 2] = b;
  }
  header.push(palette);
  header.push(Buffer.from([0x21, 0xff, 0x0b, ...Buffer.from("NETSCAPE2.0", "ascii"), 0x03, 0x01, 0x00, 0x00, 0x00]));

  const frames = [];
  for (const framePath of framePaths) {
    const { data } = await sharp(framePath)
      .resize(width, height, { fit: "cover" })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const indices = Buffer.alloc(width * height);
    for (let p = 0, i = 0; p < data.length; p += 3, i += 1) {
      indices[i] = mapToPalette(data[p], data[p + 1], data[p + 2]);
    }
    const gce = Buffer.alloc(8);
    gce[0] = 0x21;
    gce[1] = 0xf9;
    gce[2] = 0x04;
    gce[3] = 0x00;
    gce.writeUInt16LE(120, 4);
    gce[6] = 0x00;
    gce[7] = 0x00;
    const descriptor = Buffer.alloc(10);
    descriptor[0] = 0x2c;
    descriptor.writeUInt16LE(0, 1);
    descriptor.writeUInt16LE(0, 3);
    descriptor.writeUInt16LE(width, 5);
    descriptor.writeUInt16LE(height, 7);
    descriptor[9] = 0x00;
    frames.push(gce, descriptor, lzwEncode(indices));
  }

  await writeFile(gifPath, Buffer.concat([...header, ...frames, Buffer.from([0x3b])]));
}

await mkdir(frameDir, { recursive: true });
const { child, wsUrl } = await startChrome();
const client = connectCdp(wsUrl);

try {
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Network.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await client.send("Network.setCookie", {
    name: "pastilulus_session",
    value: encodeSession(),
    domain: "127.0.0.1",
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  });

  const frames = [];
  frames.push(await capture(client, 1, `${baseUrl}/siswa`, "1. Buka dashboard siswa dan pilih menu langganan."));
  frames.push(await capture(client, 2, `${baseUrl}/siswa/langganan`, "2. Pilih paket belajar yang ingin dibeli."));
  frames.push(await capture(client, 3, `${baseUrl}/pembayaran?paket=belajar`, "3. Cek ringkasan paket, promo, dan ketentuan."));
  frames.push(await capture(client, 4, `${baseUrl}/pembayaran?paket=belajar`, "4. Lihat panduan pembayaran per metode: QRIS, VA, e-wallet, dan kartu.", 760));
  frames.push(await capture(client, 5, `${baseUrl}/pembayaran/status?status=pending&order_id=PL-DEMO-TUTORIAL`, "5. Setelah bayar, cek status dan riwayat transaksi."));

  await makeGif(frames);
  const stat = await readFile(gifPath);
  console.log(JSON.stringify({ gifPath, bytes: stat.length, frames: frames.length }, null, 2));
} finally {
  client.close();
  child.kill();
}
