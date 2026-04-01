import { useState } from "react";
import type { Language } from "../lib/content";
import { LANGUAGE_INFO } from "../lib/content";

interface Props {
  onSelectLanguage: (lang: Language) => void;
}

export default function IntroScreen({ onSelectLanguage }: Props) {
  const [hovered, setHovered] = useState<Language | null>(null);

  return (
    <div className="gradient-hero min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Animated background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "15%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "oklch(0.45 0.22 280 / 0.15)",
            filter: "blur(80px)",
            animation: "pulse 4s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "10%",
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "oklch(0.78 0.18 75 / 0.12)",
            filter: "blur(60px)",
            animation: "pulse 5s ease-in-out infinite reverse",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "60%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "oklch(0.68 0.18 25 / 0.1)",
            filter: "blur(60px)",
            animation: "pulse 6s ease-in-out infinite",
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="animate-bounce-in mb-6">
          <div style={{ fontSize: 72, lineHeight: 1 }}>🐦</div>
        </div>

        <h1
          className="animate-slide-up"
          style={{
            fontFamily: "Fraunces, serif",
            fontWeight: 900,
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            background:
              "linear-gradient(135deg, oklch(0.95 0.04 280), oklch(0.78 0.18 75), oklch(0.68 0.18 25))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.5rem",
          }}
        >
          Sparrow Learning
        </h1>

        <p
          className="animate-slide-up"
          style={{
            color: "oklch(0.82 0.04 280)",
            fontSize: "1.15rem",
            marginBottom: "2.5rem",
            animationDelay: "0.1s",
            opacity: 0,
            animation: "slide-up 0.4s ease-out 0.15s forwards",
          }}
        >
          Learn any language, one tiny step at a time. ✨<br />
          <span style={{ fontSize: "0.95rem", color: "oklch(0.65 0.04 280)" }}>
            500 levels · 3 languages · Progress at your own pace
          </span>
        </p>

        <p
          style={{
            color: "oklch(0.72 0.08 280)",
            fontSize: "1rem",
            fontWeight: 600,
            marginBottom: "1.25rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Choose a Language
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {(
            Object.entries(LANGUAGE_INFO) as [
              Language,
              (typeof LANGUAGE_INFO)[Language],
            ][]
          ).map(([lang, info]) => (
            <button
              type="button"
              key={lang}
              onClick={() => onSelectLanguage(lang)}
              onMouseEnter={() => setHovered(lang)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background:
                  hovered === lang
                    ? "oklch(0.55 0.22 280)"
                    : "oklch(0.22 0.08 280)",
                border: `2px solid ${hovered === lang ? "oklch(0.65 0.18 280)" : "oklch(0.32 0.10 280)"}`,
                color: "oklch(0.95 0.02 280)",
                borderRadius: "1rem",
                padding: "1.25rem 2rem",
                minWidth: 160,
                cursor: "pointer",
                transition: "all 0.2s ease",
                transform:
                  hovered === lang ? "translateY(-4px) scale(1.04)" : "none",
                boxShadow:
                  hovered === lang
                    ? "0 12px 32px oklch(0.45 0.22 280 / 0.4)"
                    : "0 4px 16px oklch(0 0 0 / 0.3)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 8 }}>{info.flag}</div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                {info.name}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "oklch(0.72 0.06 280)",
                  marginTop: 2,
                }}
              >
                {info.nativeName}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "oklch(0.65 0.10 75)",
                  marginTop: 4,
                }}
              >
                500 levels
              </div>
            </button>
          ))}
        </div>

        <p
          style={{
            color: "oklch(0.55 0.04 280)",
            fontSize: "0.85rem",
            marginTop: "2.5rem",
          }}
        >
          No account needed · All progress saved locally
        </p>
      </div>
    </div>
  );
}
