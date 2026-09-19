import { useEffect, useState } from "react";
import { GENERATE_MIN_MS } from "../data/flow";
import { generatePoster } from "../services/generatePoster";
import { useExperience } from "../store/ExperienceProvider";
import { PrimaryButton } from "../components/PrimaryButton";

const STAGES = [
  "正在读取你的音乐能量……",
  "正在重塑你的音乐形象……",
  "正在注入你的音乐人格……",
  "正在完成专属海报……",
];

export function GeneratingPage() {
  const {
    selectedPersona,
    selectedStyle,
    capturedImage,
    nickname,
    festivalId,
    generateError,
    setGeneratedPoster,
    setGenerateError,
    goTo,
  } = useExperience();
  const [progress, setProgress] = useState(8);
  const [stage, setStage] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      if (!selectedPersona || !selectedStyle || !capturedImage) {
        setGenerateError("缺少生成所需的选择，请返回重试");
        return;
      }
      setGenerateError(null);
      const started = Date.now();
      try {
        const poster = await generatePoster({
          persona: selectedPersona,
          style: selectedStyle,
          image: capturedImage,
          nickname,
          festivalId,
        });
        const wait = Math.max(0, GENERATE_MIN_MS - (Date.now() - started));
        await new Promise((resolve) => window.setTimeout(resolve, wait));
        if (cancelled) return;
        setGeneratedPoster(poster);
        goTo("result");
      } catch {
        if (!cancelled) setGenerateError("生成失败，请重新生成");
      }
    };
    void start();
    return () => {
      cancelled = true;
    };
  }, [
    attempt,
    capturedImage,
    festivalId,
    goTo,
    nickname,
    selectedPersona,
    selectedStyle,
    setGenerateError,
    setGeneratedPoster,
  ]);

  useEffect(() => {
    setProgress(8);
    setStage(0);
    const progressTimer = window.setInterval(() => {
      setProgress((value) => Math.min(96, value + 3));
    }, 160);
    const stageTimer = window.setInterval(() => {
      setStage((value) => Math.min(STAGES.length - 1, value + 1));
    }, 1200);
    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(stageTimer);
    };
  }, [attempt]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-12 text-center">
      <p className="mb-4 text-lg tracking-[0.4em] text-fuchsia-200/80">PULSE AIGC</p>
      <h1 className="font-display text-5xl font-extrabold text-white md:text-6xl">
        AI 正在生成你的音乐人格海报……
      </h1>
      <p className="mt-8 text-3xl text-white/80">{STAGES[stage]}</p>

      <div className="relative mt-16 h-64 w-64">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 opacity-40 blur-2xl" />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(#d946ef ${progress}%, rgba(255,255,255,0.08) 0)`,
            mask: "radial-gradient(farthest-side, transparent calc(100% - 16px), #000 calc(100% - 15px))",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 16px), #000 calc(100% - 15px))",
          }}
        />
        <div className="absolute inset-8 flex items-center justify-center rounded-full border border-white/15 bg-black/40 text-4xl font-semibold text-white">
          {generateError ? "!" : `${progress}%`}
        </div>
      </div>

      <div className="mt-12 h-3 w-[min(640px,70vw)] overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {generateError ? (
        <div className="mt-10 flex flex-col items-center gap-5">
          <p className="text-2xl text-rose-200">{generateError}</p>
          <div className="flex gap-4">
            <PrimaryButton
              onClick={() => {
                setAttempt((n) => n + 1);
              }}
            >
              重新生成
            </PrimaryButton>
            <PrimaryButton variant="ghost" onClick={() => goTo("capture")}>
              返回重拍
            </PrimaryButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
