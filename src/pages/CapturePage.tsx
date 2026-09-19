import { useEffect, useRef, useState } from "react";
import { BackButton } from "../components/BackButton";
import { PrimaryButton } from "../components/PrimaryButton";
import { StageHeader } from "../components/StageHeader";
import { captureFrame, createSamplePhoto, requestCamera, stopStream } from "../services/camera";
import { useExperience } from "../store/ExperienceProvider";
import { useGuardedClick } from "../hooks/useGuardedClick";

type CameraStatus = "requesting" | "live" | "denied" | "missing" | "preview";

export function CapturePage() {
  const { setCapturedImage, goTo, capturedImage } = useExperience();
  const guard = useGuardedClick();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>(capturedImage ? "preview" : "requesting");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(capturedImage);
  const [message, setMessage] = useState(
    capturedImage ? "确认这张照片，或重新拍摄" : "正在开启摄像头…",
  );

  const releaseCamera = () => {
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => {
    if (capturedImage) return;
    let cancelled = false;
    const start = async () => {
      try {
        const stream = await requestCamera();
        if (cancelled) {
          stopStream(stream);
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("live");
        setMessage("请看镜头，保持微笑");
      } catch (error) {
        const code = error instanceof Error ? error.message : "CAMERA_UNAVAILABLE";
        setStatus(code === "PERMISSION_DENIED" ? "denied" : "missing");
        setMessage(
          code === "PERMISSION_DENIED"
            ? "摄像头权限被拒绝，可以使用示例照片继续"
            : "未检测到摄像头，可以使用示例照片继续",
        );
      }
    };
    void start();
    return () => {
      cancelled = true;
      releaseCamera();
    };
  }, [capturedImage]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      const video = videoRef.current;
      try {
        if (video) {
          const frame = captureFrame(video);
          setPreview(frame);
          setStatus("preview");
          setMessage("确认这张照片，或重新拍摄");
          releaseCamera();
        }
      } catch {
        setMessage("拍摄失败，请再试一次或使用示例照片");
        setStatus("live");
      }
      setCountdown(null);
      return;
    }
    const timer = window.setTimeout(() => setCountdown((n) => (n === null ? null : n - 1)), 900);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const useSample = () => {
    releaseCamera();
    const sample = createSamplePhoto();
    setPreview(sample);
    setStatus("preview");
    setMessage("确认这张照片，或重新拍摄");
  };

  const confirm = () => {
    if (!preview) return;
    setCapturedImage(preview);
    goTo("generating");
  };

  const retake = () => {
    setPreview(null);
    setStatus("requesting");
    setMessage("正在重新开启摄像头…");
    void (async () => {
      try {
        const stream = await requestCamera();
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("live");
        setMessage("请看镜头，保持微笑");
      } catch {
        setStatus("denied");
        setMessage("无法重新开启摄像头，请使用示例照片");
      }
    })();
  };

  return (
    <div className="relative h-full">
      <BackButton />
      <StageHeader kicker="STEP 04" title="拍一张照片，生成你的音乐形象" />
      <div className="flex h-[calc(100%-140px)] items-center justify-center gap-16 px-12 pb-10">
        <div className="relative">
          <div className="absolute -inset-6 rounded-[42px] bg-gradient-to-br from-fuchsia-500/30 via-transparent to-cyan-400/30 blur-xl" />
          <div className="relative h-[62vh] w-[min(46vw,620px)] overflow-hidden rounded-[36px] border-2 border-cyan-200/60 bg-black scanlines">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`h-full w-full object-cover ${status === "preview" ? "hidden" : "block"}`}
              style={{ transform: "scaleX(-1)" }}
            />
            {status === "preview" && preview ? (
              <img src={preview} alt="拍摄预览" className="h-full w-full object-cover" />
            ) : null}
            <div className="pointer-events-none absolute inset-8 rounded-[24px] border border-white/40" />
            <div className="pointer-events-none absolute left-8 top-8 h-10 w-10 border-l-4 border-t-4 border-cyan-300" />
            <div className="pointer-events-none absolute right-8 top-8 h-10 w-10 border-r-4 border-t-4 border-fuchsia-300" />
            <div className="pointer-events-none absolute bottom-8 left-8 h-10 w-10 border-b-4 border-l-4 border-fuchsia-300" />
            <div className="pointer-events-none absolute bottom-8 right-8 h-10 w-10 border-b-4 border-r-4 border-cyan-300" />
            {countdown !== null ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <span className="font-display text-[180px] font-extrabold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.55)]">
                  {countdown}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="max-w-md">
          <p className="text-3xl leading-snug text-white">{message}</p>
          <div className="mt-10 flex flex-col gap-5">
            {status === "live" && countdown === null ? (
              <PrimaryButton onClick={() => guard(() => setCountdown(3))}>开始拍摄</PrimaryButton>
            ) : null}
            {status === "preview" ? (
              <>
                <PrimaryButton onClick={() => guard(confirm)}>使用这张照片</PrimaryButton>
                <PrimaryButton variant="ghost" onClick={() => guard(retake)}>
                  重新拍摄
                </PrimaryButton>
              </>
            ) : null}
            {status === "denied" || status === "missing" || status === "requesting" ? (
              <PrimaryButton variant="ghost" onClick={() => guard(useSample)}>
                使用示例照片
              </PrimaryButton>
            ) : null}
            {status === "live" ? (
              <PrimaryButton variant="ghost" onClick={() => guard(useSample)}>
                使用示例照片
              </PrimaryButton>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
