export type Step =
  | "attract"
  | "nickname"
  | "persona"
  | "style"
  | "capture"
  | "generating"
  | "result";

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

export interface Persona {
  id: PersonaId;
  name: string;
  englishName: string;
  tagline: string;
  slogan: string;
  accent: string;
  accentSoft: string;
}

export interface VisualStyle {
  id: StyleId;
  name: string;
  englishName: string;
  preview: {
    from: string;
    via: string;
    to: string;
    filter: string;
  };
}

export interface GeneratePosterInput {
  persona: Persona;
  style: VisualStyle;
  image: string;
  nickname: string;
  festivalId: string;
}

export interface ExperienceState {
  currentStep: Step;
  selectedPersona: Persona | null;
  selectedStyle: VisualStyle | null;
  capturedImage: string | null;
  generatedPoster: string | null;
  nickname: string;
  festivalId: string;
  generateError: string | null;
  isBusy: boolean;
  recentPosters: string[];
}
