import { useEffect, useRef } from "react";
import { IDLE_TIMEOUT_MS } from "../data/flow";
import { useExperience } from "../store/ExperienceProvider";

export function useIdleReset() {
  const { currentStep, reset } = useExperience();
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const clear = () => {
      if (timer.current) window.clearTimeout(timer.current);
    };

    const arm = () => {
      clear();
      if (currentStep === "attract" || currentStep === "generating") return;
      timer.current = window.setTimeout(() => {
        reset();
      }, IDLE_TIMEOUT_MS);
    };

    arm();
    const events = ["pointerdown", "pointermove", "keydown", "touchstart"];
    events.forEach((event) => window.addEventListener(event, arm, { passive: true }));
    return () => {
      clear();
      events.forEach((event) => window.removeEventListener(event, arm));
    };
  }, [currentStep, reset]);
}
