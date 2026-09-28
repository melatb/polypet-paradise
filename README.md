# Polypet Paradise

A pet-raising math game for Grade 6. Solving problems takes care of your pet's needs, earns coins, hatches eggs and helps pets grow up. Each growth stage unlocks a new color and outfit.

Math content is based on [Illustrative Mathematics 6–8 Math v.360](https://illustrativemathematics.org/) (CC BY-NC 4.0), so this project must stay non-commercial.

## Run it

```bash
npm install
npm run dev            # local dev server with hot reload
npm run build          # production build in dist/ (for Firebase Hosting later)
npm run build:artifact # single-file preview in dist-single/artifact.html
npm run typecheck
```

## How the code is organized

```
src/
  game/                 Game rules, no UI
    types.ts            Shapes of pets, looks and the saved game
    catalog.ts          Pets, rarities, eggs, needs, growth stages, wardrobe unlocks
    rules.ts            Pure functions: answering, feeding, growing, hatching, levels
    storage.ts          Where saves live (browser today; Firebase in Phase 2)
    GameProvider.tsx    React context that connects the rules and storage to the UI
  math/
    types.ts            Question, QuestionType, Lesson and Zone types
    Figure.tsx          Draws grid diagrams from plain data
    units/
      index.ts          Registry of playable zones + the Grade 6 roadmap
      g6u1/             Unit 1, "Triangles and Other Polygons": questions + lessons
  pets/PetArt.tsx       Pet and egg drawings, colors and outfits
  components/           Yard, question sheet, hatching, panels, HUD
  fx/Fx.tsx             Confetti, flying coins, toasts
```

### Adding a new unit or section

1. Create `src/math/units/g6uN/` with a `questions.ts` exporting `QuestionType[]` and a `lessons.tsx` exporting `Lesson[]`. Copy `g6u1` as a template.
2. Register a `Zone` for it in `src/math/units/index.ts`.

Each question type has an `unlockLevel` (the player level where it starts appearing) and a `make()` function that generates a fresh random problem. The game logic never needs to change to add math.

## Roadmap

- [x] **Phase 1: Foundation.** React + TypeScript. Animations (walking, blinking, hopping, egg cracking, flying coins). Growth-stage colors and outfits with a wardrobe.
- [ ] **Phase 2: Accounts.** Firebase Authentication with invitation-only, parent-managed family accounts. Cloud saves via a Firestore `GameStorage`.
- [ ] **Phase 3: All of Grade 6.** Units 2–9 as new worlds.
- [ ] **Phase 4: Friends and trading.** Friend codes, trade requests, two-sided confirmation, no free-text chat.
- [ ] **Phase 5: Trimathlons.** Timed competitions with family leaderboards.

## Kids' privacy

Players are family and invited guests only. Phase 2 accounts will be created and managed by a parent. The app should not collect personal information from children beyond a display name, and social features stay limited to invited players.
