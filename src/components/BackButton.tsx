import { useExperience } from "../store/ExperienceProvider";
import { useGuardedClick } from "../hooks/useGuardedClick";

export function BackButton() {
  const { goBack, currentStep, isBusy } = useExperience();
  const guard = useGuardedClick();
  if (currentStep === "attract" || currentStep === "generating") return null;

  return (
    <button
      type="button"
      disabled={isBusy}
      onClick={() => guard(goBack)}
      className="absolute left-8 top-8 z-20 min-h-16 min-w-36 rounded-full border border-white/20 bg-black/30 px-7 text-xl text-white backdrop-blur-md"
    >
      返回
    </button>
  );
}
