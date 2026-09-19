export function PulseLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text = size === "lg" ? "text-5xl" : size === "sm" ? "text-xl" : "text-3xl";
  const mark = size === "lg" ? "h-10 w-10" : size === "sm" ? "h-5 w-5" : "h-7 w-7";
  return (
    <div className="flex items-center gap-3">
      <span
        className={`${mark} rounded-full bg-gradient-to-br from-fuchsia-400 via-violet-500 to-cyan-400 shadow-neon`}
      />
      <span className={`font-display font-extrabold tracking-[0.22em] text-white ${text}`}>
        PULSE
      </span>
    </div>
  );
}
