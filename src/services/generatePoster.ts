import type { GeneratePosterInput, StyleId } from "../types/experience";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const ir = img.width / img.height;
  const r = w / h;
  let dw: number;
  let dh: number;
  let dx: number;
  let dy: number;
  if (ir > r) {
    dh = h;
    dw = h * ir;
    dx = x - (dw - w) / 2;
    dy = y;
  } else {
    dw = w;
    dh = w / ir;
    dx = x;
    dy = y - (dh - h) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

function applyStyleGrade(ctx: CanvasRenderingContext2D, styleId: StyleId, w: number, h: number) {
  if (styleId === "mono") {
    const image = ctx.getImageData(0, 0, w, h);
    const data = image.data;
    for (let i = 0; i < data.length; i += 4) {
      const g = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
      const v = Math.min(255, g * 1.15);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
    ctx.putImageData(image, 0, 0);
  }

  ctx.save();
  if (styleId === "cyberpunk") {
    ctx.globalCompositeOperation = "overlay";
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "rgba(34, 211, 238, 0.55)");
    g.addColorStop(0.5, "rgba(236, 72, 153, 0.2)");
    g.addColorStop(1, "rgba(168, 85, 247, 0.6)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else if (styleId === "y2k") {
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(244, 114, 182, 0.22)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = "rgba(125, 211, 252, 0.28)";
    ctx.fillRect(0, 0, w, h);
  } else if (styleId === "film") {
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(180, 120, 60, 0.28)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = "rgba(120, 80, 40, 0.25)";
    ctx.fillRect(0, 0, w, h);
  } else if (styleId === "graffiti") {
    ctx.globalCompositeOperation = "overlay";
    const g = ctx.createLinearGradient(0, h, w, 0);
    g.addColorStop(0, "rgba(34, 197, 94, 0.45)");
    g.addColorStop(0.5, "rgba(250, 204, 21, 0.25)");
    g.addColorStop(1, "rgba(236, 72, 153, 0.45)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else if (styleId === "starry") {
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(30, 27, 75, 0.35)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(167, 139, 250, 0.22)";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

function drawStars(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 90; i += 1) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 1.8;
    ctx.globalAlpha = 0.25 + Math.random() * 0.7;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGrain(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;
  for (let i = 0; i < data.length; i += 16) {
    const n = (Math.random() - 0.5) * 28;
    data[i] = Math.max(0, Math.min(255, data[i] + n));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
  }
  ctx.putImageData(image, 0, 0);
}

function drawScanlines(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1);
  }
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Demo poster composer. Swap the body of this function with a real AIGC API later.
 */
export async function generatePoster(input: GeneratePosterInput): Promise<string> {
  const { persona, style, image, nickname, festivalId } = input;
  const width = 1080;
  const height = 1440;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_UNAVAILABLE");

  const photo = await loadImage(image);

  ctx.fillStyle = "#07050f";
  ctx.fillRect(0, 0, width, height);
  drawCover(ctx, photo, 0, 0, width, height);
  applyStyleGrade(ctx, style.id, width, height);

  if (style.id === "starry" || style.id === "cyberpunk") drawStars(ctx, width, height);
  if (style.id === "film" || style.id === "mono") drawGrain(ctx, width, height);
  if (style.id === "cyberpunk") drawScanlines(ctx, width, height);

  const veil = ctx.createLinearGradient(0, 0, 0, height);
  veil.addColorStop(0, "rgba(7,5,15,0.25)");
  veil.addColorStop(0.45, "rgba(7,5,15,0.08)");
  veil.addColorStop(0.72, "rgba(7,5,15,0.35)");
  veil.addColorStop(1, "rgba(7,5,15,0.88)");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = persona.accent;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 10;
  ctx.strokeRect(48, 48, width - 96, height - 96);
  ctx.restore();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "700 42px Syne, sans-serif";
  ctx.fillText("PULSE", 84, 130);
  ctx.font = "500 22px Space Grotesk, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("MUSIC FESTIVAL  ·  LIVE TONIGHT", 84, 168);

  ctx.textAlign = "right";
  ctx.fillStyle = persona.accent;
  ctx.font = "700 24px Space Grotesk, sans-serif";
  ctx.fillText(festivalId, width - 84, 130);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "500 20px Space Grotesk, sans-serif";
  ctx.fillText(style.englishName, width - 84, 168);
  ctx.textAlign = "left";

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "600 28px Noto Sans SC, sans-serif";
  ctx.fillText(nickname, 84, height - 280);

  ctx.fillStyle = persona.accent;
  ctx.font = "800 92px Syne, Noto Sans SC, sans-serif";
  ctx.fillText(persona.name, 84, height - 175);

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "400 54px Bebas Neue, sans-serif";
  ctx.fillText(persona.englishName, 84, height - 112);

  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = "500 28px Noto Sans SC, sans-serif";
  ctx.fillText(`「${persona.slogan}」`, 84, height - 62);

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  roundRect(ctx, width - 250, height - 118, 166, 46, 23);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "700 18px Space Grotesk, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PULSE LIVE", width - 167, height - 88);
  ctx.restore();

  return canvas.toDataURL("image/jpeg", 0.92);
}
