import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { DEFAULT_NICKNAME } from "../data/flow";
import type {
  ExperienceState,
  Persona,
  Step,
  VisualStyle,
} from "../types/experience";

type Action =
  | { type: "GO"; step: Step }
  | { type: "SELECT_PERSONA"; persona: Persona }
  | { type: "SELECT_STYLE"; style: VisualStyle }
  | { type: "SET_NICKNAME"; nickname: string }
  | { type: "SET_IMAGE"; image: string }
  | { type: "SET_POSTER"; poster: string }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_BUSY"; busy: boolean }
  | { type: "RESET" };

function createFestivalId() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `PULSE-2026-${n}`;
}

function initialState(): ExperienceState {
  return {
    currentStep: "attract",
    selectedPersona: null,
    selectedStyle: null,
    capturedImage: null,
    generatedPoster: null,
    nickname: DEFAULT_NICKNAME,
    festivalId: createFestivalId(),
    generateError: null,
    isBusy: false,
    recentPosters: [],
  };
}

function reducer(state: ExperienceState, action: Action): ExperienceState {
  switch (action.type) {
    case "GO":
      return { ...state, currentStep: action.step, isBusy: false };
    case "SELECT_PERSONA":
      return { ...state, selectedPersona: action.persona };
    case "SELECT_STYLE":
      return { ...state, selectedStyle: action.style };
    case "SET_NICKNAME":
      return { ...state, nickname: action.nickname };
    case "SET_IMAGE":
      return { ...state, capturedImage: action.image };
    case "SET_POSTER":
      return {
        ...state,
        generatedPoster: action.poster,
        generateError: null,
        recentPosters: [action.poster, ...state.recentPosters].slice(0, 3),
      };
    case "SET_ERROR":
      return { ...state, generateError: action.error };
    case "SET_BUSY":
      return { ...state, isBusy: action.busy };
    case "RESET":
      return initialState();
    default:
      return state;
  }
}

interface ExperienceContextValue extends ExperienceState {
  goTo: (step: Step) => void;
  selectPersona: (persona: Persona) => void;
  selectStyle: (style: VisualStyle) => void;
  setNickname: (nickname: string) => void;
  setCapturedImage: (image: string) => void;
  setGeneratedPoster: (poster: string) => void;
  setGenerateError: (error: string | null) => void;
  setBusy: (busy: boolean) => void;
  goBack: () => void;
  reset: () => void;
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

const BACK_MAP: Partial<Record<Step, Step>> = {
  nickname: "attract",
  persona: "nickname",
  style: "persona",
  capture: "style",
  generating: "capture",
  result: "capture",
};

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const goTo = useCallback((step: Step) => dispatch({ type: "GO", step }), []);
  const selectPersona = useCallback(
    (persona: Persona) => dispatch({ type: "SELECT_PERSONA", persona }),
    [],
  );
  const selectStyle = useCallback(
    (style: VisualStyle) => dispatch({ type: "SELECT_STYLE", style }),
    [],
  );
  const setNickname = useCallback(
    (nickname: string) => dispatch({ type: "SET_NICKNAME", nickname }),
    [],
  );
  const setCapturedImage = useCallback(
    (image: string) => dispatch({ type: "SET_IMAGE", image }),
    [],
  );
  const setGeneratedPoster = useCallback(
    (poster: string) => dispatch({ type: "SET_POSTER", poster }),
    [],
  );
  const setGenerateError = useCallback(
    (error: string | null) => dispatch({ type: "SET_ERROR", error }),
    [],
  );
  const setBusy = useCallback(
    (busy: boolean) => dispatch({ type: "SET_BUSY", busy }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const goBack = useCallback(() => {
    const prev = BACK_MAP[state.currentStep];
    if (prev) dispatch({ type: "GO", step: prev });
  }, [state.currentStep]);

  const value = useMemo<ExperienceContextValue>(
    () => ({
      ...state,
      goTo,
      selectPersona,
      selectStyle,
      setNickname,
      setCapturedImage,
      setGeneratedPoster,
      setGenerateError,
      setBusy,
      goBack,
      reset,
    }),
    [
      state,
      goTo,
      selectPersona,
      selectStyle,
      setNickname,
      setCapturedImage,
      setGeneratedPoster,
      setGenerateError,
      setBusy,
      goBack,
      reset,
    ],
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    throw new Error("useExperience must be used within ExperienceProvider");
  }
  return ctx;
}
