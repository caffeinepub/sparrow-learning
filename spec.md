# Sparrow Learning - Full Rebuild

## Current State
App exists with 3 languages (Japanese, Mandarin, Kannada), basic lesson engine, streaks, XP, dark mode. Limited levels (~10-20 per language). Color scheme is generic.

## Requested Changes (Diff)

### Add
- 500-level progression system per language, organized as: Units (groups of 10 levels each = 50 units) → each unit covers a fragment/theme/topic
- Level types cycle through: vocabulary intro, multiple choice, fill-in-the-blank, translation, listening (audio), matching pairs
- Each level is a small bite-sized lesson (3-5 exercises) like Duolingo
- Level map/path UI showing progression with locked/unlocked/completed states
- Premium OKLCH color palette: deep violet-indigo as primary, warm amber/gold as accent, soft coral for highlights - vibrant but not childish, works for teens, college students, and seniors
- Animated level completion celebration
- Hearts/lives system (5 hearts, lose on wrong answer, regenerate over time)
- Unit completion badge/milestone rewards

### Modify
- Full color system overhaul with premium OKLCH tokens
- Home page redesigned as a level map (vertical scroll path)
- Progress stats redesigned with premium card UI
- All typography upgraded for readability (seniors friendly, larger base size)

### Remove
- Old flat lesson list UI
- Generic color palette

## Implementation Plan
1. Define level content data: generate 500 levels per language as structured JSON arrays inside content.ts, each level with: id, unit, title, type, exercises[]
2. Build LevelMap component: vertical winding path of level nodes, locked/unlocked/completed states, unit headers
3. Build ExerciseEngine: handles all exercise types (vocab, mcq, fill-blank, translate, match)
4. Build HeartsSystem: 5 hearts, lose on mistake, localStorage persist
5. Implement new OKLCH premium color system in index.css and tailwind.config
6. Rebuild HomePage as level map with floating stats bar
7. Keep streaks, XP, dark mode
