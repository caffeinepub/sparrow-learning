import { useCallback, useEffect, useState } from "react";
import type { Exercise, Language, Level } from "../lib/content";
import { getLevel } from "../lib/content";
import type { LangProgress } from "../lib/storage";
import {
  addMistake,
  completeLevel,
  getProgress,
  loseHeart,
} from "../lib/storage";

interface Props {
  language: Language;
  levelId: number;
  onComplete: () => void;
  onClose: () => void;
  darkMode: boolean;
}

type Feedback = { type: "correct" | "wrong"; message: string } | null;

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
}

const COLORS = [
  "oklch(0.65 0.22 280)",
  "oklch(0.78 0.18 75)",
  "oklch(0.68 0.18 25)",
  "oklch(0.62 0.18 145)",
  "oklch(0.72 0.18 200)",
];

function makeConfetti(): ConfettiPiece[] {
  return Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1,
  }));
}

export default function ExerciseEngine({
  language,
  levelId,
  onComplete,
  onClose,
  darkMode,
}: Props) {
  const level = getLevel(language, levelId);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [progress, setProgress] = useState<LangProgress>(() =>
    getProgress(language),
  );
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [shake, setShake] = useState(false);
  const [showNoHearts, setShowNoHearts] = useState(false);

  // Match exercise state
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [wrongMatch, setWrongMatch] = useState<string | null>(null);

  // Fill/translate state
  const [inputValue, setInputValue] = useState("");

  // Vocab revealed
  const [vocabRevealed, setVocabRevealed] = useState(false);

  // MCQ selected
  const [mcqSelected, setMcqSelected] = useState<string | null>(null);
  const [mcqConfirmed, setMcqConfirmed] = useState(false);

  if (!level) return null;

  const currentExercise = level.exercises[exerciseIdx];
  const totalExercises = level.exercises.length;

  const resetExerciseState = () => {
    setInputValue("");
    setVocabRevealed(false);
    setMcqSelected(null);
    setMcqConfirmed(false);
    setSelectedLeft(null);
    setMatchedPairs([]);
    setWrongMatch(null);
  };

  const handleCorrect = (xp = 10) => {
    setFeedback({ type: "correct", message: `Correct! +${xp} XP` });
    setXpEarned((prev) => prev + xp);
    setTimeout(() => {
      setFeedback(null);
      if (exerciseIdx + 1 >= totalExercises) {
        const updated = completeLevel(language, levelId, xpEarned + xp);
        setProgress(updated);
        setConfetti(makeConfetti());
        setShowComplete(true);
      } else {
        setExerciseIdx((i) => i + 1);
        resetExerciseState();
      }
    }, 1200);
  };

  const handleWrong = (answer: string) => {
    addMistake(language, { word: answer, translation: "", levelId });
    const updated = loseHeart(language);
    setProgress(updated);
    setShake(true);
    setTimeout(() => setShake(false), 400);
    if (updated.hearts <= 0) {
      setShowNoHearts(true);
      return;
    }
    setFeedback({
      type: "wrong",
      message: `Not quite! The answer was: ${answer}`,
    });
    setTimeout(() => {
      setFeedback(null);
      setMcqSelected(null);
      setMcqConfirmed(false);
      setInputValue("");
    }, 1500);
  };

  const bg = darkMode ? "oklch(0.12 0.04 280)" : "oklch(0.97 0.01 280)";
  const cardBg = darkMode ? "oklch(0.18 0.05 280)" : "oklch(1 0 0)";
  const textPrimary = darkMode
    ? "oklch(0.95 0.01 280)"
    : "oklch(0.15 0.04 280)";
  const textMuted = darkMode ? "oklch(0.62 0.06 280)" : "oklch(0.55 0.06 280)";
  const borderColor = darkMode
    ? "oklch(0.28 0.06 280)"
    : "oklch(0.88 0.04 280)";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Confetti */}
      {confetti.length > 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          {confetti.map((c) => (
            <div
              key={c.id}
              style={{
                position: "absolute",
                top: -20,
                left: `${c.x}%`,
                width: 10,
                height: 10,
                borderRadius: "2px",
                background: c.color,
                animation: `confetti-fall ${c.duration}s ease-in ${c.delay}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem 1.25rem",
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "none",
            border: `1px solid ${borderColor}`,
            borderRadius: "0.5rem",
            padding: "0.4rem 0.8rem",
            cursor: "pointer",
            color: textMuted,
            fontSize: "0.9rem",
          }}
        >
          ✕
        </button>

        {/* Progress bar */}
        <div
          style={{
            flex: 1,
            height: 10,
            background: darkMode
              ? "oklch(0.25 0.06 280)"
              : "oklch(0.90 0.03 280)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background:
                "linear-gradient(90deg, oklch(0.55 0.22 280), oklch(0.65 0.18 280))",
              borderRadius: 999,
              width: `${(exerciseIdx / totalExercises) * 100}%`,
              transition: "width 0.4s ease",
            }}
          />
        </div>

        {/* Hearts */}
        <div style={{ display: "flex", gap: 3 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              style={{
                fontSize: "1.1rem",
                opacity: n <= progress.hearts ? 1 : 0.2,
                transition: "opacity 0.3s",
              }}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* Exercise content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <div
          className={shake ? "animate-shake" : "animate-slide-up"}
          style={{
            width: "100%",
            maxWidth: 520,
            background: cardBg,
            borderRadius: "1.25rem",
            border: `1px solid ${borderColor}`,
            padding: "2rem",
            boxShadow: "0 8px 32px oklch(0.45 0.22 280 / 0.08)",
          }}
        >
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "oklch(0.65 0.18 280)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "1rem",
            }}
          >
            {exerciseIdx + 1} / {totalExercises}
          </div>

          {currentExercise.type === "vocab" && (
            <VocabExercise
              exercise={currentExercise}
              revealed={vocabRevealed}
              onReveal={() => setVocabRevealed(true)}
              onGotIt={() => handleCorrect(15)}
              textPrimary={textPrimary}
              textMuted={textMuted}
              borderColor={borderColor}
              darkMode={darkMode}
            />
          )}

          {currentExercise.type === "mcq" && (
            <McqExercise
              exercise={currentExercise}
              selected={mcqSelected}
              confirmed={mcqConfirmed}
              onSelect={(opt) => {
                if (mcqConfirmed) return;
                setMcqSelected(opt);
                setMcqConfirmed(true);
                if (opt === currentExercise.answer) handleCorrect(10);
                else handleWrong(currentExercise.answer);
              }}
              textPrimary={textPrimary}
              textMuted={textMuted}
              borderColor={borderColor}
              darkMode={darkMode}
            />
          )}

          {currentExercise.type === "fill" && (
            <FillExercise
              exercise={currentExercise}
              value={inputValue}
              onChange={setInputValue}
              onSubmit={() => {
                const correct =
                  inputValue.trim().toLowerCase() ===
                  currentExercise.answer.toLowerCase();
                if (correct) handleCorrect(12);
                else handleWrong(currentExercise.answer);
              }}
              textPrimary={textPrimary}
              textMuted={textMuted}
              borderColor={borderColor}
              darkMode={darkMode}
            />
          )}

          {currentExercise.type === "match" && (
            <MatchExercise
              exercise={currentExercise}
              selectedLeft={selectedLeft}
              matchedPairs={matchedPairs}
              wrongMatch={wrongMatch}
              onSelectLeft={(w) => {
                if (matchedPairs.includes(w)) return;
                setSelectedLeft(w === selectedLeft ? null : w);
              }}
              onSelectRight={(t) => {
                if (!selectedLeft) return;
                const correctTranslation = currentExercise.pairs.find(
                  (p) => p.word === selectedLeft,
                )?.translation;
                if (t === correctTranslation) {
                  const newMatched = [...matchedPairs, selectedLeft];
                  setMatchedPairs(newMatched);
                  setSelectedLeft(null);
                  if (newMatched.length === currentExercise.pairs.length) {
                    handleCorrect(20);
                  }
                } else {
                  setWrongMatch(selectedLeft);
                  setTimeout(() => setWrongMatch(null), 600);
                  handleWrong(correctTranslation || "");
                  setSelectedLeft(null);
                }
              }}
              textPrimary={textPrimary}
              textMuted={textMuted}
              borderColor={borderColor}
              darkMode={darkMode}
            />
          )}

          {currentExercise.type === "translate" && (
            <TranslateExercise
              exercise={currentExercise}
              value={inputValue}
              onChange={setInputValue}
              onSubmit={() => {
                const correct =
                  inputValue.trim().toLowerCase() ===
                  currentExercise.answer.toLowerCase();
                if (correct) handleCorrect(15);
                else handleWrong(currentExercise.answer);
              }}
              textPrimary={textPrimary}
              textMuted={textMuted}
              borderColor={borderColor}
              darkMode={darkMode}
            />
          )}
        </div>

        {/* Feedback banner */}
        {feedback && (
          <div
            className="animate-slide-up"
            style={{
              marginTop: "1.25rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              fontWeight: 600,
              fontSize: "1rem",
              ...(feedback.type === "correct"
                ? {
                    background: "oklch(0.62 0.18 145 / 0.15)",
                    border: "2px solid oklch(0.62 0.18 145)",
                    color: "oklch(0.55 0.18 145)",
                  }
                : {
                    background: "oklch(0.58 0.22 25 / 0.15)",
                    border: "2px solid oklch(0.58 0.22 25)",
                    color: "oklch(0.52 0.22 25)",
                  }),
            }}
          >
            {feedback.type === "correct" ? "✅ " : "❌ "}
            {feedback.message}
          </div>
        )}
      </div>

      {/* Level Complete Modal */}
      {showComplete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "oklch(0 0 0 / 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "1rem",
          }}
        >
          <div
            className="animate-bounce-in"
            style={{
              background: darkMode ? "oklch(0.18 0.05 280)" : "oklch(1 0 0)",
              borderRadius: "1.5rem",
              padding: "2.5rem",
              maxWidth: 400,
              width: "100%",
              textAlign: "center",
              border: "2px solid oklch(0.78 0.18 75)",
              boxShadow: "0 20px 60px oklch(0.78 0.18 75 / 0.3)",
            }}
          >
            <div style={{ fontSize: 64, marginBottom: "0.5rem" }}>🎉</div>
            <h2
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "1.8rem",
                color: "oklch(0.78 0.18 75)",
                marginBottom: "0.5rem",
              }}
            >
              Level Complete!
            </h2>
            <p style={{ color: textMuted, marginBottom: "1rem" }}>
              {level.levelTitle}
            </p>
            <div
              style={{
                background: darkMode
                  ? "oklch(0.22 0.06 280)"
                  : "oklch(0.96 0.02 280)",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  color: "oklch(0.78 0.18 75)",
                }}
              >
                ⚡ +{xpEarned} XP earned!
              </span>
            </div>
            <button
              type="button"
              onClick={onComplete}
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.50 0.22 280), oklch(0.60 0.18 260))",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.9rem 2.5rem",
                fontSize: "1.1rem",
                fontWeight: 700,
                cursor: "pointer",
                width: "100%",
                transition: "all 0.2s ease",
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* No Hearts Modal */}
      {showNoHearts && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "oklch(0 0 0 / 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "1rem",
          }}
        >
          <div
            className="animate-bounce-in"
            style={{
              background: darkMode ? "oklch(0.18 0.05 280)" : "oklch(1 0 0)",
              borderRadius: "1.5rem",
              padding: "2.5rem",
              maxWidth: 380,
              width: "100%",
              textAlign: "center",
              border: "2px solid oklch(0.58 0.22 25)",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: "0.5rem" }}>💔</div>
            <h2
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: "1.6rem",
                color: "oklch(0.58 0.22 25)",
                marginBottom: "0.5rem",
              }}
            >
              Out of Hearts!
            </h2>
            <p
              style={{
                color: textMuted,
                marginBottom: "1.5rem",
                fontSize: "0.95rem",
              }}
            >
              Hearts regenerate 1 every 30 minutes. Come back later or keep
              practicing!
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "oklch(0.58 0.22 25)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.9rem 2rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                width: "100%",
              }}
            >
              Go back to map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Exercise Sub-components
// ============================================================

interface ExerciseProps {
  textPrimary: string;
  textMuted: string;
  borderColor: string;
  darkMode: boolean;
}

function VocabExercise({
  exercise,
  revealed,
  onReveal,
  onGotIt,
  textPrimary,
  textMuted,
}: ExerciseProps & {
  exercise: Extract<Exercise, { type: "vocab" }>;
  revealed: boolean;
  onReveal: () => void;
  onGotIt: () => void;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: textMuted, fontSize: "0.9rem", marginBottom: "1rem" }}>
        New Word
      </p>
      <div
        style={{
          fontSize: "clamp(2.5rem, 8vw, 4rem)",
          fontWeight: 700,
          color: textPrimary,
          marginBottom: "0.5rem",
          lineHeight: 1.2,
        }}
      >
        {exercise.word}
      </div>
      {exercise.pronunciation && (
        <div
          style={{
            fontSize: "1rem",
            color: "oklch(0.65 0.18 280)",
            marginBottom: "1rem",
            fontStyle: "italic",
          }}
        >
          [{exercise.pronunciation}]
        </div>
      )}
      {revealed ? (
        <>
          <div
            style={{
              fontSize: "1.3rem",
              fontWeight: 600,
              color: textPrimary,
              marginBottom: "1.5rem",
              padding: "0.75rem",
              background: "oklch(0.62 0.18 145 / 0.1)",
              borderRadius: "0.75rem",
            }}
          >
            {exercise.translation}
          </div>
          <button
            type="button"
            onClick={onGotIt}
            style={{
              background:
                "linear-gradient(135deg, oklch(0.50 0.22 280), oklch(0.60 0.18 260))",
              color: "white",
              border: "none",
              borderRadius: "0.75rem",
              padding: "0.85rem 2rem",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Got it! ✓
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={onReveal}
          style={{
            background: "oklch(0.78 0.18 75)",
            color: "oklch(0.15 0.04 280)",
            border: "none",
            borderRadius: "0.75rem",
            padding: "0.85rem 2rem",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Reveal meaning 👀
        </button>
      )}
    </div>
  );
}

function McqExercise({
  exercise,
  selected,
  confirmed,
  onSelect,
  textPrimary,
  textMuted,
  borderColor,
  darkMode,
}: ExerciseProps & {
  exercise: Extract<Exercise, { type: "mcq" }>;
  selected: string | null;
  confirmed: boolean;
  onSelect: (opt: string) => void;
}) {
  return (
    <div>
      <p
        style={{ color: textMuted, fontSize: "0.9rem", marginBottom: "0.5rem" }}
      >
        Choose the correct answer
      </p>
      <div
        style={{
          fontSize: "clamp(1.5rem, 5vw, 2.2rem)",
          fontWeight: 700,
          color: textPrimary,
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        {exercise.question}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
        }}
      >
        {exercise.options.map((opt) => {
          let bg = darkMode ? "oklch(0.22 0.06 280)" : "oklch(0.94 0.03 280)";
          let border = borderColor;
          let color = textPrimary;
          if (confirmed && selected === opt) {
            if (opt === exercise.answer) {
              bg = "oklch(0.62 0.18 145 / 0.2)";
              border = "oklch(0.62 0.18 145)";
              color = "oklch(0.45 0.18 145)";
            } else {
              bg = "oklch(0.58 0.22 25 / 0.2)";
              border = "oklch(0.58 0.22 25)";
              color = "oklch(0.50 0.22 25)";
            }
          } else if (confirmed && opt === exercise.answer) {
            bg = "oklch(0.62 0.18 145 / 0.15)";
            border = "oklch(0.62 0.18 145)";
            color = "oklch(0.45 0.18 145)";
          }
          return (
            <button
              type="button"
              key={opt}
              onClick={() => !confirmed && onSelect(opt)}
              style={{
                background: bg,
                border: `2px solid ${border}`,
                borderRadius: "0.75rem",
                padding: "0.9rem 0.75rem",
                cursor: confirmed ? "default" : "pointer",
                color,
                fontWeight: 600,
                fontSize: "0.95rem",
                transition: "all 0.15s ease",
                textAlign: "center",
                minHeight: 52,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FillExercise({
  exercise,
  value,
  onChange,
  onSubmit,
  textPrimary,
  textMuted,
  borderColor,
  darkMode,
}: ExerciseProps & {
  exercise: Extract<Exercise, { type: "fill" }>;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div>
      <p style={{ color: textMuted, fontSize: "0.9rem", marginBottom: "1rem" }}>
        Fill in the blank
      </p>
      <div
        style={{
          fontSize: "1.25rem",
          fontWeight: 600,
          color: textPrimary,
          marginBottom: "0.5rem",
          textAlign: "center",
        }}
      >
        {exercise.sentence}
      </div>
      <p
        style={{
          color: "oklch(0.65 0.18 280)",
          fontSize: "0.85rem",
          textAlign: "center",
          marginBottom: "1.25rem",
        }}
      >
        {exercise.hint}
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && value.trim() && onSubmit()}
        placeholder="Type your answer..."
        style={{
          width: "100%",
          padding: "0.85rem 1rem",
          borderRadius: "0.75rem",
          border: `2px solid ${borderColor}`,
          background: darkMode
            ? "oklch(0.22 0.06 280)"
            : "oklch(0.97 0.01 280)",
          color: textPrimary,
          fontSize: "1.05rem",
          marginBottom: "1rem",
          outline: "none",
          transition: "border-color 0.2s",
        }}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!value.trim()}
        style={{
          background: value.trim()
            ? "linear-gradient(135deg, oklch(0.50 0.22 280), oklch(0.60 0.18 260))"
            : "oklch(0.60 0.04 280)",
          color: "white",
          border: "none",
          borderRadius: "0.75rem",
          padding: "0.85rem",
          fontSize: "1rem",
          fontWeight: 700,
          cursor: value.trim() ? "pointer" : "not-allowed",
          width: "100%",
        }}
      >
        Check Answer
      </button>
    </div>
  );
}

function MatchExercise({
  exercise,
  selectedLeft,
  matchedPairs,
  wrongMatch,
  onSelectLeft,
  onSelectRight,
  textPrimary,
  textMuted,
  borderColor,
  darkMode,
}: ExerciseProps & {
  exercise: Extract<Exercise, { type: "match" }>;
  selectedLeft: string | null;
  matchedPairs: string[];
  wrongMatch: string | null;
  onSelectLeft: (w: string) => void;
  onSelectRight: (t: string) => void;
}) {
  const shuffledRight = [...exercise.pairs].sort(() => 0.5 - Math.random());

  return (
    <div>
      <p
        style={{
          color: textMuted,
          fontSize: "0.9rem",
          marginBottom: "1.25rem",
        }}
      >
        Match the pairs
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.6rem",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
        >
          {exercise.pairs.map((p) => {
            const isMatched = matchedPairs.includes(p.word);
            const isSelected = selectedLeft === p.word;
            const isWrong = wrongMatch === p.word;
            return (
              <button
                type="button"
                key={p.word}
                onClick={() => !isMatched && onSelectLeft(p.word)}
                style={{
                  padding: "0.7rem",
                  borderRadius: "0.65rem",
                  border: `2px solid ${isMatched ? "oklch(0.62 0.18 145)" : isSelected ? "oklch(0.65 0.18 280)" : isWrong ? "oklch(0.58 0.22 25)" : borderColor}`,
                  background: isMatched
                    ? "oklch(0.62 0.18 145 / 0.15)"
                    : isSelected
                      ? "oklch(0.65 0.18 280 / 0.15)"
                      : isWrong
                        ? "oklch(0.58 0.22 25 / 0.1)"
                        : darkMode
                          ? "oklch(0.22 0.06 280)"
                          : "oklch(0.95 0.02 280)",
                  color: isMatched ? "oklch(0.45 0.18 145)" : textPrimary,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: isMatched ? "default" : "pointer",
                  transition: "all 0.15s",
                  minHeight: 44,
                }}
              >
                {p.word}
              </button>
            );
          })}
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
        >
          {shuffledRight.map((p) => {
            const isMatched = matchedPairs.includes(p.word);
            return (
              <button
                type="button"
                key={p.translation}
                onClick={() => !isMatched && onSelectRight(p.translation)}
                style={{
                  padding: "0.7rem",
                  borderRadius: "0.65rem",
                  border: `2px solid ${isMatched ? "oklch(0.62 0.18 145)" : borderColor}`,
                  background: isMatched
                    ? "oklch(0.62 0.18 145 / 0.15)"
                    : darkMode
                      ? "oklch(0.22 0.06 280)"
                      : "oklch(0.95 0.02 280)",
                  color: isMatched ? "oklch(0.45 0.18 145)" : textPrimary,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: isMatched ? "default" : "pointer",
                  transition: "all 0.15s",
                  minHeight: 44,
                }}
              >
                {p.translation}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TranslateExercise({
  exercise,
  value,
  onChange,
  onSubmit,
  textPrimary,
  textMuted,
  borderColor,
  darkMode,
}: ExerciseProps & {
  exercise: Extract<Exercise, { type: "translate" }>;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div>
      <p style={{ color: textMuted, fontSize: "0.9rem", marginBottom: "1rem" }}>
        Translate this phrase
      </p>
      <div
        style={{
          fontSize: "1.4rem",
          fontWeight: 700,
          color: textPrimary,
          textAlign: "center",
          marginBottom: "0.5rem",
          padding: "1rem",
          background: "oklch(0.65 0.18 280 / 0.1)",
          borderRadius: "0.75rem",
        }}
      >
        {exercise.source}
      </div>
      <p
        style={{
          color: "oklch(0.65 0.18 280)",
          fontSize: "0.8rem",
          textAlign: "center",
          marginBottom: "1.25rem",
        }}
      >
        {exercise.hint}
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && value.trim() && onSubmit()}
        placeholder="Write the translation..."
        style={{
          width: "100%",
          padding: "0.85rem 1rem",
          borderRadius: "0.75rem",
          border: `2px solid ${borderColor}`,
          background: darkMode
            ? "oklch(0.22 0.06 280)"
            : "oklch(0.97 0.01 280)",
          color: textPrimary,
          fontSize: "1.05rem",
          marginBottom: "1rem",
          outline: "none",
        }}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!value.trim()}
        style={{
          background: value.trim()
            ? "linear-gradient(135deg, oklch(0.50 0.22 280), oklch(0.60 0.18 260))"
            : "oklch(0.60 0.04 280)",
          color: "white",
          border: "none",
          borderRadius: "0.75rem",
          padding: "0.85rem",
          fontSize: "1rem",
          fontWeight: 700,
          cursor: value.trim() ? "pointer" : "not-allowed",
          width: "100%",
        }}
      >
        Submit
      </button>
    </div>
  );
}
