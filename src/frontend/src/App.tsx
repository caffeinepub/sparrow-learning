import { useEffect, useState } from "react";
import ExerciseEngine from "./components/ExerciseEngine";
import IntroScreen from "./components/IntroScreen";
import LevelMap from "./components/LevelMap";
import type { Language } from "./lib/content";
import { getDarkMode, setDarkMode } from "./lib/storage";

type Screen = "intro" | "map" | "exercise";

export default function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [language, setLanguage] = useState<Language>("japanese");
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [darkMode, setDark] = useState(() => getDarkMode());
  const [mapRefresh, setMapRefresh] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    setDarkMode(darkMode);
  }, [darkMode]);

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setScreen("map");
  };

  const handleStartLevel = (levelId: number) => {
    setActiveLevelId(levelId);
    setScreen("exercise");
  };

  const handleExerciseComplete = () => {
    setMapRefresh((r) => r + 1);
    setScreen("map");
  };

  const handleExerciseClose = () => {
    setScreen("map");
  };

  const toggleDark = () => setDark((d) => !d);

  if (screen === "intro") {
    return <IntroScreen onSelectLanguage={handleSelectLanguage} />;
  }

  if (screen === "map") {
    return (
      <LevelMap
        key={mapRefresh}
        language={language}
        onStartLevel={handleStartLevel}
        onBack={() => setScreen("intro")}
        darkMode={darkMode}
        onToggleDark={toggleDark}
      />
    );
  }

  return (
    <ExerciseEngine
      language={language}
      levelId={activeLevelId}
      onComplete={handleExerciseComplete}
      onClose={handleExerciseClose}
      darkMode={darkMode}
    />
  );
}
