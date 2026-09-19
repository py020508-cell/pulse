/**
 * 后端 Prompt 映射：根据 persona（音乐人格）与 style（视觉风格）构建图片生成提示词。
 *
 * 约定：后端只负责生成「人物主视觉」，不含文字 / Logo / 二维码 / 水印；
 * 昵称、人格名称、品牌 Logo、Festival ID、二维码等由前端模板叠加。
 */

export type PersonaId =
  | "rock"
  | "edm"
  | "poet"
  | "soul"
  | "healer"
  | "party";

export type StyleId =
  | "cyberpunk"
  | "y2k"
  | "film"
  | "graffiti"
  | "starry"
  | "mono";

const BASE_PROMPT = [
  "A single young adult who is the same person as in the reference photo, centered in a vertical 3:4 portrait composition.",
  "Faithfully preserve the person's real facial identity, facial structure, skin tone, hairstyle and overall likeness from the reference photo — the face must remain clearly recognizable.",
  "The person is the only human subject, posed as a trendy music-festival attendee with confident, expressive body language and high-energy stage lighting.",
  "Premium concert photography, sharp focus, high detail, cinematic color, 4k.",
].join(" ");

const PERSONA_PROMPTS: Record<PersonaId, string> = {
  rock:
    "Persona: a rebellious rock rebel. Fierce intense gaze, raw rock-and-roll attitude, electric-guitar energy, dramatic moody rim light, subtle motion and sweat, powerful stage presence.",
  edm:
    "Persona: a euphoric EDM player. Neon club lighting, festival DJ vibe, dynamic dancing pose with hands raised, glowing bass-drop intensity, pure electronic-music euphoria.",
  poet:
    "Persona: a dreamy romantic poet. Soft melancholic gaze, lyrical gentle mood, floating musical notes as glowing light particles, ethereal backlight, poetic and tender atmosphere.",
  soul:
    "Persona: a free-spirited soul. Carefree joyful expression, wind-blown movement, warm golden-hour glow, effortless freedom and optimism, radiant natural energy.",
  healer:
    "Persona: a calm healing creator. Serene gentle smile, soft pastel glow, peaceful ambient light, soothing and tender mood, warm inviting presence.",
  party:
    "Persona: a wild party animal. Ecstatic celebration, confetti explosion, dazzling disco lights, glow sticks and colorful confetti, peak festival-night excitement.",
};

const STYLE_PROMPTS: Record<StyleId, string> = {
  cyberpunk:
    "Visual style: cyberpunk. Neon cyan, magenta and purple color grading, holographic glitch accents, futuristic techwear details, high-contrast neon glow and reflective surfaces.",
  y2k:
    "Visual style: Y2K chrome. Iridescent metallic pink-blue gradients, retro-futuristic 2000s glamour, glossy chrome accents and soft dreamy lens flare.",
  film:
    "Visual style: vintage film photography. Warm sepia and amber color grade, subtle film grain, soft light leaks and a nostalgic analog-camera look.",
  graffiti:
    "Visual style: urban graffiti street art. Bold saturated green, yellow and pink spray-paint splashes, dynamic halftone patterns and hand-drawn sticker-collage energy.",
  starry:
    "Visual style: dreamy starry night. Deep indigo and violet galaxy background, sparkling stars and nebula glow, ethereal celestial light and cosmic fantasy.",
  mono:
    "Visual style: minimal black and white. High-contrast monochrome, dramatic studio lighting, clean editorial photography and a timeless grayscale look.",
};

const NEGATIVE_CONSTRAINTS = [
  "Absolutely no text, letters, words, numbers, captions, logos, watermarks or QR codes anywhere in the image.",
  "Do not depict any celebrity, public figure, existing brand character or third-party intellectual property.",
].join(" ");

export function buildPrompt(personaId: string, styleId: string): string {
  const persona =
    PERSONA_PROMPTS[personaId as PersonaId] ??
    PERSONA_PROMPTS.rock;
  const style =
    STYLE_PROMPTS[styleId as StyleId] ??
    STYLE_PROMPTS.cyberpunk;

  return [BASE_PROMPT, persona, style, NEGATIVE_CONSTRAINTS].join(" ");
}

/**
 * 供「万相通用图像编辑（wanx2.1-imageedit）」风格化使用的精简提示词。
 * 风格化只改变画风、色彩与氛围，模型会保留输入照片的构图与人物，因此这里
 * 不重复“保留面部”等基础约束，只聚焦风格与气质，控制在 800 字符以内。
 */

const PERSONA_MOOD: Record<PersonaId, string> = {
  rock: "狂野摇滚气场，锐利眼神，电吉他能量感",
  edm: "电子音乐狂欢，霓虹律动，高能量舞台感",
  poet: "梦幻诗意，柔和忧郁，发光音符般的浪漫氛围",
  soul: "自由随性，洒脱不羁，温暖金色光晕",
  healer: "治愈温柔，平静安详，柔和光晕",
  party: "派对狂欢，彩带与迪斯科灯光，热烈奔放",
};

const STYLE_DESC: Record<StyleId, string> = {
  cyberpunk: "赛博朋克风格，霓虹青紫配色，未来科技感，高对比度",
  y2k: "Y2K千禧风，炫彩金属粉蓝渐变，复古未来感",
  film: "复古胶片质感，暖棕色调，颗粒感，怀旧氛围",
  graffiti: "街头涂鸦风，高饱和绿黄粉喷漆，波普拼贴感",
  starry: "梦幻星空，深蓝紫银河，星光辉光，宇宙感",
  mono: "极简黑白，高对比度，影棚质感，经典",
};

export function buildStylePrompt(personaId: string, styleId: string): string {
  const mood = PERSONA_MOOD[personaId as PersonaId] ?? PERSONA_MOOD.rock;
  const style = STYLE_DESC[styleId as StyleId] ?? STYLE_DESC.cyberpunk;

  return `人像风格化：${style}。人物气质：${mood}。不要添加文字、Logo、二维码或水印。`;
}
