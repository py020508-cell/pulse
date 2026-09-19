import { VISUAL_STYLES } from "../data/styles";
import { SELECT_ADVANCE_MS } from "../data/flow";
import { BackButton } from "../components/BackButton";
import { StageHeader } from "../components/StageHeader";
import { useExperience } from "../store/ExperienceProvider";
import { useGuardedClick } from "../hooks/useGuardedClick";
import type { VisualStyle } from "../types/experience";

export function StylePage() {
  const { selectedStyle, selectStyle, goTo, isBusy, setBusy } = useExperience();
  const guard = useGuardedClick();

  const choose = (style: VisualStyle) => {
    if (isBusy) return;
    selectStyle(style);
    setBusy(true);
    window.setTimeout(() => goTo("capture"), SELECT_ADVANCE_MS);
  };

  return (
    <div className="relative h-full">
      <BackButton />
      <StageHeader kicker="STEP 02" title="选择你喜欢的视觉风格" />
      <div className="grid h-[calc(100%-140px)] grid-cols-3 gap-6 px-12 pb-10 pt-8">
        {VISUAL_STYLES.map((style) => {
          const selected = selectedStyle?.id === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => guard(() => choose(style))}
              className={`overflow-hidden rounded-[32px] text-left transition ${
                selected ? "ring-4 ring-cyan-300 scale-[1.02]" : "hover:scale-[1.01]"
              }`}
            >
              <div
                className="relative h-full min-h-[240px] p-7"
                style={{
                  background: `linear-gradient(145deg, ${style.preview.from}, ${style.preview.via}, ${style.preview.to})`,
                  filter: style.preview.filter,
                }}
              >
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="h-24 rounded-2xl border border-white/25 bg-white/10 backdrop-blur-md" />
                  <div>
                    <h2 className="font-display text-4xl font-extrabold text-white drop-shadow">
                      {style.name}
                    </h2>
                    <p className="mt-2 font-poster text-2xl tracking-wider text-white/80">
                      {style.englishName}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
