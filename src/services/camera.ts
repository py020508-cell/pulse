export function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export async function requestCamera(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("NO_CAMERA");
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      throw new Error("PERMISSION_DENIED");
    }
    if (name === "NotFoundError" || name === "OverconstrainedError") {
      throw new Error("NO_CAMERA");
    }
    throw new Error("CAMERA_UNAVAILABLE");
  }
}

export function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  const width = video.videoWidth || 720;
  const height = video.videoHeight || 960;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CAPTURE_FAILED");
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.92);
}

export function createSamplePhoto(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 960;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const gradient = ctx.createLinearGradient(0, 0, 720, 960);
  gradient.addColorStop(0, "#1e1b4b");
  gradient.addColorStop(0.5, "#6d28d9");
  gradient.addColorStop(1, "#db2777");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 720, 960);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (let i = 0; i < 40; i += 1) {
    ctx.beginPath();
    ctx.arc(Math.random() * 720, Math.random() * 960, Math.random() * 18, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#f5d0fe";
  ctx.beginPath();
  ctx.ellipse(360, 430, 148, 190, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4c1d95";
  ctx.beginPath();
  ctx.ellipse(360, 250, 120, 90, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.arc(310, 400, 16, 0, Math.PI * 2);
  ctx.arc(410, 400, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#1e1b4b";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(360, 470, 48, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "700 36px Syne, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PULSE SAMPLE", 360, 860);

  return canvas.toDataURL("image/jpeg", 0.92);
}
