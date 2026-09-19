import { useState } from "react";
import { DEFAULT_NICKNAME } from "../data/flow";
import { BackButton } from "../components/BackButton";
import { PrimaryButton } from "../components/PrimaryButton";
import { StageHeader } from "../components/StageHeader";
import { useExperience } from "../store/ExperienceProvider";
import { useGuardedClick } from "../hooks/useGuardedClick";

const MAX_LENGTH = 12;

export function NicknamePage() {
  const { nickname, setNickname, goTo, isBusy, setBusy } = useExperience();
  const guard = useGuardedClick();
  const [value, setValue] = useState(nickname === DEFAULT_NICKNAME ? "" : nickname);

  const submit = () => {
    if (isBusy) return;
    const trimmed = value.trim();
    setNickname(trimmed || DEFAULT_NICKNAME);
    setBusy(true);
    window.setTimeout(() => goTo("persona"), 280);
  };

  const confirm = () => guard(submit);

  return (
    <div className="relative h-full">
      <BackButton />
      <StageHeader kicker="STEP 01" title="先告诉我们，怎么称呼你" />

      <div className="flex h-[calc(100%-140px)] flex-col items-center justify-center px-12 pb-10">
        <div className="glass-card w-[min(720px,80vw)] rounded-[40px] px-12 py-14 text-center">
          <p className="text-2xl text-white/70">
            输入你的昵称，将印在专属音乐人格海报上
          </p>

          <div className="relative mt-12">
            <input
              type="text"
              value={value}
              maxLength={MAX_LENGTH}
              autoFocus
              placeholder={DEFAULT_NICKNAME}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") confirm();
              }}
              className="w-full border-b-2 border-white/25 bg-transparent pb-4 text-center font-display text-5xl font-extrabold text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-300"
            />
            <p className="mt-4 text-lg text-white/45">
              {value.trim().length}/{MAX_LENGTH}
            </p>
          </div>

          <div className="mt-12 flex justify-center">
            <PrimaryButton onClick={confirm} disabled={isBusy}>
              下一步
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
