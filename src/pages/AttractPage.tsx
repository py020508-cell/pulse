import { PERSONAS } from "../data/personas";
import { VISUAL_STYLES } from "../data/styles";
import { PulseLogo } from "../components/PulseLogo";
import { PrimaryButton } from "../components/PrimaryButton";
import { useExperience } from "../store/ExperienceProvider";
import { useGuardedClick } from "../hooks/useGuardedClick";

const SAMPLE_POSTERS = [
  { persona: PERSONAS[3], style: VISUAL_STYLES[4], name: "林晚" },
  { persona: PERSONAS[1], style: VISUAL_STYLES[0], name: "阿泽" },
  { persona: PERSONAS[5], style: VISUAL_STYLES[1], name: "Mika" },
];

export function AttractPage() {
  const { goTo, recentPosters } = useExperience();
  const guard = useGuardedClick();

  return (
    <div className="relative flex h-full flex-col px-12 py-10">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 animate-pulseGlow rounded-full bg-fuchsia-500/30 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-24 h-80 w-80 animate-pulseGlow rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="flex items-center justify-between">
        <PulseLogo size="lg" />
        <p className="text-lg tracking-[0.3em] text-white/60">MUSIC FESTIVAL LIVE</p>
      </div>

      <div className="mt-10 grid flex-1 grid-cols-[1.15fr_0.85fr] items-center gap-10">
        <div className="animate-fadeUp">
          <p className="mb-5 text-xl tracking-[0.35em] text-fuchsia-200/90">
            AIGC 互动大屏
          </p>
          <h1 className="font-display text-7xl font-extrabold leading-[1.08] text-white xl:text-8xl">
            今晚，你是哪种
            <br />
            <span className="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              音乐人格？
            </span>
          </h1>
          <p className="mt-8 max-w-3xl text-3xl text-white/80">
            AI 生成你的专属音乐节海报
          </p>
          <div className="mt-12">
            <PrimaryButton onClick={() => guard(() => goTo("nickname"))}>
              开始生成
            </PrimaryButton>
          </div>
        </div>

        <div className="relative h-[70vh]">
          {(recentPosters.length > 0
            ? recentPosters.map((src, index) => (
                <img
                  key={`live-${index}`}
                  src={src}
                  alt="已生成海报"
                  className={`absolute w-[280px] aspect-[3/4] object-cover overflow-hidden rounded-[28px] border border-white/15 shadow-glow animate-float ${
                    ["left-6 top-4 rotate-[-8deg]", "right-4 top-24 rotate-[7deg]", "left-16 bottom-2 rotate-[3deg]"][
                      index
                    ]
                  }`}
                  style={{ animationDelay: `${index * 0.4}s` }}
                />
              ))
            : SAMPLE_POSTERS.map((item, index) => (
                <SampleCard key={item.persona.id} index={index} item={item} />
              )))}
        </div>
      </div>
    </div>
  );
}

function SampleCard({
  index,
  item,
}: {
  index: number;
  item: (typeof SAMPLE_POSTERS)[number];
}) {
  const positions = [
    "left-6 top-4 rotate-[-8deg]",
    "right-4 top-24 rotate-[7deg]",
    "left-16 bottom-2 rotate-[3deg]",
  ];
  const { persona, style, name } = item;
  return (
    <div
      className={`absolute w-[280px] overflow-hidden rounded-[28px] border border-white/15 shadow-glow animate-float aspect-[3/4] p-5 ${positions[index]}`}
      style={{ animationDelay: `${index * 0.4}s` }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, ${style.preview.from}, ${style.preview.via}, ${style.preview.to})`,
        }}
      />
      <div className="relative z-10 flex h-full flex-col justify-between text-white">
        <div className="flex items-center justify-between text-sm tracking-[0.2em]">
          <span>PULSE</span>
          <span>FEST 2026</span>
        </div>
        <div>
          <p className="text-lg text-white/80">{name}</p>
          <h3 className="mt-1 font-display text-4xl font-extrabold">{persona.name}</h3>
          <p className="mt-2 font-poster text-2xl tracking-wider">{persona.englishName}</p>
        </div>
      </div>
    </div>
  );
}
