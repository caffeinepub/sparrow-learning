import type { Language } from "./content";

export interface MistakeEntry {
  word: string;
  translation: string;
  language: Language;
  levelId: number;
  date: string;
}

export interface LangProgress {
  xp: number;
  currentLevel: number;
  completedLevels: number[];
  hearts: number;
  lastHeartTime: number;
  streak: number;
  lastStreakDate: string;
  mistakes: MistakeEntry[];
}

const MAX_HEARTS = 5;
const HEART_REGEN_MS = 30 * 60 * 1000; // 30 minutes

const DEFAULT_PROGRESS: LangProgress = {
  xp: 0,
  currentLevel: 1,
  completedLevels: [],
  hearts: MAX_HEARTS,
  lastHeartTime: 0,
  streak: 0,
  lastStreakDate: "",
  mistakes: [],
};

function key(lang: Language): string {
  return `sparrow_${lang}`;
}

export function getProgress(lang: Language): LangProgress {
  try {
    const raw = localStorage.getItem(key(lang));
    if (!raw) return { ...DEFAULT_PROGRESS };
    const p = JSON.parse(raw) as LangProgress;
    return regenHearts(p);
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(lang: Language, progress: LangProgress): void {
  localStorage.setItem(key(lang), JSON.stringify(progress));
}

function regenHearts(p: LangProgress): LangProgress {
  if (p.hearts >= MAX_HEARTS) return p;
  const now = Date.now();
  const elapsed = now - (p.lastHeartTime || now);
  const heartsToAdd = Math.floor(elapsed / HEART_REGEN_MS);
  if (heartsToAdd > 0) {
    const newHearts = Math.min(MAX_HEARTS, p.hearts + heartsToAdd);
    return {
      ...p,
      hearts: newHearts,
      lastHeartTime:
        newHearts >= MAX_HEARTS ? 0 : now - (elapsed % HEART_REGEN_MS),
    };
  }
  return p;
}

export function loseHeart(lang: Language): LangProgress {
  const p = getProgress(lang);
  const newHearts = Math.max(0, p.hearts - 1);
  const updated = {
    ...p,
    hearts: newHearts,
    lastHeartTime: newHearts < MAX_HEARTS ? Date.now() : 0,
  };
  saveProgress(lang, updated);
  return updated;
}

export function completeLevel(
  lang: Language,
  levelId: number,
  xpEarned: number,
): LangProgress {
  const p = getProgress(lang);
  const completedLevels = p.completedLevels.includes(levelId)
    ? p.completedLevels
    : [...p.completedLevels, levelId];

  // Update streak
  const today = new Date().toISOString().slice(0, 10);
  let { streak, lastStreakDate } = p;
  if (lastStreakDate !== today) {
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);
    streak = lastStreakDate === yesterday ? streak + 1 : 1;
    lastStreakDate = today;
  }

  const updated = {
    ...p,
    xp: p.xp + xpEarned,
    completedLevels,
    currentLevel: Math.max(p.currentLevel, levelId + 1),
    streak,
    lastStreakDate,
  };
  saveProgress(lang, updated);
  return updated;
}

export function addMistake(
  lang: Language,
  entry: Omit<MistakeEntry, "language" | "date">,
): void {
  const p = getProgress(lang);
  const mistake: MistakeEntry = {
    ...entry,
    language: lang,
    date: new Date().toISOString(),
  };
  const mistakes = [mistake, ...p.mistakes].slice(0, 50);
  saveProgress(lang, { ...p, mistakes });
}

export function getTimeUntilNextHeart(lang: Language): number {
  const p = getProgress(lang);
  if (p.hearts >= MAX_HEARTS || !p.lastHeartTime) return 0;
  const elapsed = Date.now() - p.lastHeartTime;
  return Math.max(0, HEART_REGEN_MS - elapsed);
}

export function getDarkMode(): boolean {
  return localStorage.getItem("sparrow_dark") === "true";
}

export function setDarkMode(value: boolean): void {
  localStorage.setItem("sparrow_dark", String(value));
}

export const MAX_HEARTS_EXPORT = MAX_HEARTS;
