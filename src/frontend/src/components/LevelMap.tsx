import { useEffect, useRef, useState } from "react";
import type { Language } from "../lib/content";
import { LANGUAGE_INFO, getLevels } from "../lib/content";
import type { LangProgress } from "../lib/storage";
import { getProgress } from "../lib/storage";

interface Props {
  language: Language;
  onStartLevel: (levelId: number) => void;
  onBack: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function LevelMap({
  language,
  onStartLevel,
  onBack,
  darkMode,
  onToggleDark,
}: Props) {
  const [progress, setProgress] = useState<LangProgress>(() =>
    getProgress(language),
  );
  const currentRef = useRef<HTMLDivElement>(null);
  const levels = getLevels(language);
  const info = LANGUAGE_INFO[language];

  useEffect(() => {
    setProgress(getProgress(language));
  }, [language]);

  useEffect(() => {
    setTimeout(() => {
      currentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  }, []);

  const isCompleted = (id: number) => progress.completedLevels.includes(id);
  const isCurrent = (id: number) => id === progress.currentLevel;
  const isUnlocked = (id: number) => id <= progress.currentLevel;

  const levelsByUnit = levels.reduce<Record<number, typeof levels>>(
    (acc, level) => {
      if (!acc[level.unit]) acc[level.unit] = [];
      acc[level.unit].push(level);
      return acc;
    },
    {},
  );

  const positions = [
    "justify-start",
    "justify-center",
    "justify-end",
    "justify-center",
    "justify-start",
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode ? "oklch(0.12 0.04 280)" : "oklch(0.97 0.01 280)",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: darkMode
            ? "oklch(0.15 0.05 280 / 0.95)"
            : "oklch(0.99 0.01 280 / 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${darkMode ? "oklch(0.28 0.06 280)" : "oklch(0.88 0.04 280)"}`,
          padding: "0.75rem 1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: `1px solid ${darkMode ? "oklch(0.35 0.08 280)" : "oklch(0.82 0.06 280)"}`,
            borderRadius: "0.5rem",
            padding: "0.4rem 0.8rem",
            cursor: "pointer",
            color: darkMode ? "oklch(0.85 0.04 280)" : "oklch(0.35 0.10 280)",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          ← Back
        </button>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: 28 }}>{info.flag}</span>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "1rem",
                color: darkMode
                  ? "oklch(0.92 0.02 280)"
                  : "oklch(0.2 0.06 280)",
              }}
            >
              {info.name}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: darkMode
                  ? "oklch(0.62 0.06 280)"
                  : "oklch(0.55 0.06 280)",
              }}
            >
              Level {progress.currentLevel} of 500
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <StatChip
            icon="⚡"
            value={progress.xp}
            label="XP"
            dark={darkMode}
            color="oklch(0.78 0.18 75)"
          />
          <StatChip
            icon="🔥"
            value={progress.streak}
            label="Day"
            dark={darkMode}
            color="oklch(0.68 0.18 25)"
          />
          <HeartsChip hearts={progress.hearts} dark={darkMode} />
        </div>

        <button
          type="button"
          onClick={onToggleDark}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.3rem",
            padding: "0.25rem",
          }}
          title="Toggle dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Level Map */}
      <div
        style={{ maxWidth: 520, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}
      >
        {Object.entries(levelsByUnit).map(([unit, unitLevels]) => {
          const unitNum = Number(unit);
          const unitTitle = unitLevels[0].unitTitle;
          const allComplete = unitLevels.every((l) => isCompleted(l.id));

          return (
            <div key={unit}>
              {/* Unit Header */}
              <div
                style={{
                  margin: "1.5rem 0 1rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    background: allComplete
                      ? "linear-gradient(135deg, oklch(0.78 0.18 75), oklch(0.68 0.18 25))"
                      : darkMode
                        ? "oklch(0.22 0.08 280)"
                        : "oklch(0.90 0.04 280)",
                    color: allComplete
                      ? "oklch(0.15 0.04 280)"
                      : darkMode
                        ? "oklch(0.78 0.08 280)"
                        : "oklch(0.40 0.12 280)",
                    borderRadius: "999px",
                    padding: "0.45rem 1.25rem",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    letterSpacing: "0.03em",
                    boxShadow: allComplete
                      ? "0 4px 16px oklch(0.78 0.18 75 / 0.35)"
                      : "none",
                  }}
                >
                  {allComplete ? "✓ " : ""}Unit {unitNum}: {unitTitle}
                </div>
              </div>

              {/* Level nodes */}
              {unitLevels.map((level, idx) => {
                const completed = isCompleted(level.id);
                const current = isCurrent(level.id);
                const unlocked = isUnlocked(level.id);
                const pos = positions[idx % positions.length];

                return (
                  <div
                    key={level.id}
                    className={`flex ${pos}`}
                    style={{ marginBottom: "0.85rem" }}
                  >
                    <div
                      ref={current ? currentRef : undefined}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => unlocked && onStartLevel(level.id)}
                        disabled={!unlocked}
                        className="level-node"
                        style={{
                          width: current ? 72 : 60,
                          height: current ? 72 : 60,
                          borderRadius: "50%",
                          border: "none",
                          cursor: unlocked ? "pointer" : "not-allowed",
                          fontSize: current ? 28 : 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          transition: "all 0.2s ease",
                          position: "relative",
                          background: completed
                            ? "linear-gradient(135deg, oklch(0.78 0.18 75), oklch(0.72 0.16 55))"
                            : current
                              ? "oklch(0.50 0.22 280)"
                              : unlocked
                                ? darkMode
                                  ? "oklch(0.28 0.10 280)"
                                  : "oklch(0.88 0.06 280)"
                                : darkMode
                                  ? "oklch(0.20 0.04 280)"
                                  : "oklch(0.90 0.02 280)",
                          color: completed
                            ? "oklch(0.15 0.04 280)"
                            : current
                              ? "white"
                              : unlocked
                                ? darkMode
                                  ? "oklch(0.82 0.06 280)"
                                  : "oklch(0.35 0.12 280)"
                                : darkMode
                                  ? "oklch(0.45 0.04 280)"
                                  : "oklch(0.72 0.04 280)",
                          boxShadow: current
                            ? "0 0 0 4px oklch(0.65 0.18 280 / 0.4), 0 6px 24px oklch(0.45 0.22 280 / 0.5)"
                            : completed
                              ? "0 4px 16px oklch(0.78 0.18 75 / 0.4)"
                              : "none",
                          animation: current
                            ? "pulse-glow 2s ease-in-out infinite"
                            : "none",
                        }}
                      >
                        {completed
                          ? "★"
                          : current
                            ? "☆"
                            : unlocked
                              ? level.id
                              : "🔒"}
                      </button>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: current
                            ? "oklch(0.65 0.18 280)"
                            : completed
                              ? "oklch(0.72 0.14 75)"
                              : darkMode
                                ? "oklch(0.55 0.04 280)"
                                : "oklch(0.60 0.06 280)",
                          textAlign: "center",
                          maxWidth: 80,
                        }}
                      >
                        {level.levelTitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        <div
          style={{
            textAlign: "center",
            padding: "2rem 0",
            color: darkMode ? "oklch(0.45 0.04 280)" : "oklch(0.62 0.04 280)",
            fontSize: "0.85rem",
          }}
        >
          🏆 Keep going! You\'re building something great.
        </div>
      </div>
    </div>
  );
}

function StatChip({
  icon,
  value,
  label,
  dark,
  color,
}: {
  icon: string;
  value: number;
  label: string;
  dark: boolean;
  color: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        background: dark ? "oklch(0.20 0.06 280)" : "oklch(0.93 0.03 280)",
        borderRadius: "0.5rem",
        padding: "0.3rem 0.6rem",
      }}
    >
      <span>{icon}</span>
      <span style={{ fontWeight: 700, color, fontSize: "0.9rem" }}>
        {value}
      </span>
      <span
        style={{
          fontSize: "0.7rem",
          color: dark ? "oklch(0.55 0.04 280)" : "oklch(0.60 0.06 280)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function HeartsChip({ hearts }: { hearts: number; dark?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{ fontSize: "1rem", opacity: n <= hearts ? 1 : 0.25 }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}
