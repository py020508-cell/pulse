import { useEffect, useMemo, useState } from "react";
import { RESULT_AUTO_RETURN_MS } from "../data/flow";
import { BackButton } from "../components/BackButton";
import { PrimaryButton } from "../components/PrimaryButton";
import { PulseLogo } from "../components/PulseLogo";
import { QrCode } from "../components/QrCode";
import { useExperience } from "../store/ExperienceProvider";
import { useGuardedClick } from "../hooks/useGuardedClick";

export function ResultPage() {
  const { generatedPoster, selectedPersona, festivalId, reset, goTo } = useExperience();
  const guard = useGuardedClick();
  const [remain, setRemain] = useState(Math.round(RESULT_AUTO_RETURN_MS / 1000));

  const shareUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("poster", "demo");
    url.searchParams.set("id", festivalId);
    return url.toString();
  }, [festivalId]);

  useEffect(() => {
    if (!generatedPoster) {
      goTo("capture");
      return;
    }
    const tick = window.setInterval(() => {
      setRemain((n) => Math.max(0, n - 1));
    }, 1000);
    const auto = window.setTimeout(() => reset(), RESULT_AUTO_RETURN_MS);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(auto);
    };
  }, [generatedPoster, goTo, reset]);

  const savePoster = () => {
    if (!generatedPoster) return;
    const link = document.createElement("a");
    link.href = generatedPoster;
    link.download = `${festivalId}-pulse-poster.jpg`;
    link.click();
  };

  const sharePoster = async () => {
    if (!generatedPoster) return;
    try {
      const res = await fetch(generatedPoster);
      const blob = await res.blob();
      const file = new File([blob], "pulse-poster.jpg", { type: "image/jpeg" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "PULSE 音乐人格海报",
          text: selectedPersona?.slogan ?? "今晚，你是哪种音乐人格？",
          files: [file],
        });
        return;
      }
    } catch {
      /* fall through */
    }
    savePoster();
  };

  if (!generatedPoster) return null;

  return (
    <div className="relative h-full px-10 py-8">
      <BackButton />
      <div className="mb-6 flex items-center justify-between pl-40 pr-4">
        <div>
          <p className="text-lg tracking-[0.3em] text-fuchsia-200/80">YOUR MUSIC PERSONA</p>
          <h1 className="font-display text-5xl font-extrabold text-white">你的音乐人格海报</h1>
        </div>
        <PulseLogo />
      </div>

      <div className="grid h-[calc(100%-110px)] grid-cols-[minmax(0,1fr)_420px] gap-10">
        <div className="flex items-center justify-center">
          <img
            src={generatedPoster}
            alt="AI 音乐人格海报"
            className="max-h-full rounded-[28px] border border-white/15 shadow-glow"
          />
        </div>
        <div className="glass-card flex flex-col items-center rounded-[32px] px-8 py-10 text-center">
          <p className="text-2xl text-white">扫码带走你的专属音乐人格海报</p>
          <div className="mt-6 rounded-3xl bg-white p-3">
            <QrCode value={shareUrl} size={220} />
          </div>
          <p className="mt-4 text-lg text-white/60">{festivalId}</p>
          <div className="mt-8 flex w-full flex-col gap-4">
            <PrimaryButton className="w-full" onClick={() => guard(savePoster)}>
              保存海报
            </PrimaryButton>
            <PrimaryButton className="w-full" variant="ghost" onClick={() => guard(() => void sharePoster())}>
              分享
            </PrimaryButton>
            <PrimaryButton className="w-full" variant="light" onClick={() => guard(reset)}>
              完成
            </PrimaryButton>
          </div>
          <p className="mt-8 text-lg text-white/55">{remain} 秒后自动返回待机页</p>
        </div>
      </div>
    </div>
  );
}
