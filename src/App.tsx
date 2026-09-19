import { useEffect } from "react";
import { AttractPage } from "./pages/AttractPage";
import { CapturePage } from "./pages/CapturePage";
import { GeneratingPage } from "./pages/GeneratingPage";
import { PersonaPage } from "./pages/PersonaPage";
import { ResultPage } from "./pages/ResultPage";
import { StylePage } from "./pages/StylePage";
import { useIdleReset } from "./hooks/useIdleReset";
import { useExperience } from "./store/ExperienceProvider";

export default function App() {
  const {
    currentStep,
    selectedPersona,
    selectedStyle,
    capturedImage,
    generatedPoster,
    goTo,
  } = useExperience();
  useIdleReset();

  useEffect(() => {
    if (currentStep === "style" && !selectedPersona) goTo("persona");
    if (currentStep === "capture" && (!selectedPersona || !selectedStyle)) {
      goTo(selectedPersona ? "style" : "persona");
    }
    if (
      currentStep === "generating" &&
      (!selectedPersona || !selectedStyle || !capturedImage)
    ) {
      goTo("capture");
    }
    if (currentStep === "result" && !generatedPoster) goTo("capture");
  }, [
    capturedImage,
    currentStep,
    generatedPoster,
    goTo,
    selectedPersona,
    selectedStyle,
  ]);

  return (
    <div className="kiosk-root">
      <div className="noise-overlay" />
      <div className="page-enter relative z-10" key={currentStep}>
        {currentStep === "attract" && <AttractPage />}
        {currentStep === "persona" && <PersonaPage />}
        {currentStep === "style" && <StylePage />}
        {currentStep === "capture" && <CapturePage />}
        {currentStep === "generating" && <GeneratingPage />}
        {currentStep === "result" && <ResultPage />}
      </div>
    </div>
  );
}
