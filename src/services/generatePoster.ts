import type {
  GeneratePosterInput,
  Persona,
  VisualStyle,
} from "../types/experience";

/**
 * 调用后端 /api/generate，用真实图片生成 API 产出「人物主视觉」。
 * 返回的是可以直接绘制到 Canvas 的 data URL。
 */
async function generatePersonaVisual(
  persona: Persona,
  style: VisualStyle,
  image: string,
): Promise<string> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, persona, style }),
  });

  const data = (await response.json().catch(() => null)) as {
    image?: string;
    error?: string;
  } | null;

  if (!response.ok || !data?.image) {
    throw new Error(data?.error ?? "GENERATION_FAILED");
  }

  return data.image;
}

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
 * 最终海报合成：
 * 1. 先请求后端生成「人物主视觉」；
 * 2. 再把品牌文字、昵称、人格名称、Festival ID 等模板元素叠加到 Canvas 上。
 */
export async function generatePoster(input: GeneratePosterInput): Promise<string> {
  const { persona, style, image, nickname, festivalId } = input;
  const width = 1080;
  const height = 1440;

  const visual = await generatePersonaVisual(persona, style, image);
  const photo = await loadImage(visual);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_UNAVAILABLE");

  ctx.fillStyle = "#07050f";
  ctx.fillRect(0, 0, width, height);
  drawCover(ctx, photo, 0, 0, width, height);

  // 底部渐变压暗，保证文字清晰可读
  const veil = ctx.createLinearGradient(0, 0, 0, height);
  veil.addColorStop(0, "rgba(7,5,15,0.25)");
  veil.addColorStop(0.45, "rgba(7,5,15,0.08)");
  veil.addColorStop(0.72, "rgba(7,5,15,0.35)");
  veil.addColorStop(1, "rgba(7,5,15,0.88)");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, width, height);

  // 外框
  ctx.save();
  ctx.strokeStyle = persona.accent;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 10;
  ctx.strokeRect(48, 48, width - 96, height - 96);
  ctx.restore();

  // 品牌区
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "700 42px Syne, sans-serif";
  ctx.fillText("PULSE", 84, 130);
  ctx.font = "500 22px Space Grotesk, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("MUSIC FESTIVAL  ·  LIVE TONIGHT", 84, 168);

  // 右上角：Festival ID + 风格名
  ctx.textAlign = "right";
  ctx.fillStyle = persona.accent;
  ctx.font = "700 24px Space Grotesk, sans-serif";
  ctx.fillText(festivalId, width - 84, 130);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "500 20px Space Grotesk, sans-serif";
  ctx.fillText(style.englishName, width - 84, 168);
  ctx.textAlign = "left";

  // 昵称 + 人格信息
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

  // 右下角活动角标
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
