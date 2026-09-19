import { useEffect, useRef } from "react";

export function useGuardedClick(delay = 480) {
  const locked = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return (fn: () => void) => {
    if (locked.current) return;
    locked.current = true;
    fn();
    timer.current = window.setTimeout(() => {
      locked.current = false;
    }, delay);
  };
}
