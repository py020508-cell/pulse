import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrCodeProps {
  value: string;
  size?: number;
}

export function QrCode({ value, size = 240 }: QrCodeProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: { dark: "#14001f", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!src) {
    return (
      <div
        className="animate-pulse rounded-2xl bg-white/80"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      src={src}
      alt="扫码保存海报"
      width={size}
      height={size}
      className="rounded-2xl bg-white p-2"
    />
  );
}
