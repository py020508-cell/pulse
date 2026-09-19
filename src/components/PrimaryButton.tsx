import type { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "light";
  className?: string;
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  variant = "primary",
  className = "",
}: PrimaryButtonProps) {
  const styles = {
    primary:
      "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 text-white shadow-glow",
    ghost:
      "border border-white/25 bg-white/5 text-white hover:bg-white/10",
    light: "bg-white text-violet-950",
  }[variant];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-[84px] min-w-[240px] rounded-full px-10 text-2xl font-semibold tracking-wide transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
