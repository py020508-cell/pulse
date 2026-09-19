import { PERSONAS } from "../data/personas";
import { SELECT_ADVANCE_MS } from "../data/flow";
import { BackButton } from "../components/BackButton";
import { StageHeader } from "../components/StageHeader";
import { useExperience } from "../store/ExperienceProvider";
import { useGuardedClick } from "../hooks/useGuardedClick";
import type { Persona } from "../types/experience";

export function PersonaPage() {
  const { selectedPersona, selectPersona, goTo, isBusy, setBusy } = useExperience();
  const guard = useGuardedClick();

  const choose = (persona: Persona) => {
    if (isBusy) return;
    selectPersona(persona);
    setBusy(true);
    window.setTimeout(() => {
      goTo("style");
    }, SELECT_ADVANCE_MS);
  };

  return (
    <div className="relative h-full">
      <BackButton />
      <StageHeader kicker="STEP 02" title="选择你的音乐人格" />
      <div className="grid h-[calc(100%-140px)] grid-cols-3 gap-6 px-12 pb-10 pt-8">
        {PERSONAS.map((persona) => {
          const selected = selectedPersona?.id === persona.id;
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => guard(() => choose(persona))}
              className={`glass-card group relative overflow-hidden rounded-[32px] p-7 text-left transition ${
                selected ? "ring-4 ring-fuchsia-300 scale-[1.02]" : "hover:scale-[1.01]"
              }`}
            >
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  background: `radial-gradient(circle at 20% 0%, ${persona.accentSoft}, transparent 55%)`,
                }}
              />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div
                  className="h-28 w-28 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${persona.accent}, #1e1b4b)`,
                    boxShadow: `0 0 40px ${persona.accentSoft}`,
                  }}
                />
                <div>
                  <h2 className="font-display text-4xl font-extrabold text-white">
                    {persona.name}
                  </h2>
                  <p className="mt-2 font-poster text-2xl tracking-wider text-white/70">
                    {persona.englishName}
                  </p>
                  <p className="mt-4 text-2xl text-white/85">{persona.tagline}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
