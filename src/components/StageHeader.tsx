import { PulseLogo } from "../components/PulseLogo";

export function StageHeader({ title, kicker }: { title: string; kicker?: string }) {
  return (
    <header className="flex items-start justify-between px-12 pt-10">
      <div className="pl-40">
        {kicker ? (
          <p className="mb-2 text-lg tracking-[0.28em] text-fuchsia-200/80">{kicker}</p>
        ) : null}
        <h1 className="font-display text-5xl font-extrabold text-white md:text-6xl">
          {title}
        </h1>
      </div>
      <PulseLogo size="sm" />
    </header>
  );
}
