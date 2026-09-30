# Polypet Paradise

A pet-raising math game for Grade 6. Solving problems takes care of your pet's needs, earns coins, hatches eggs and helps pets grow up. Each growth stage unlocks a new color and outfit.

Math content is based on [Illustrative Mathematics 6–8 Math v.360](https://illustrativemathematics.org/) (CC BY-NC 4.0), so this project must stay non-commercial.

## Play it

https://melatb.github.io/polypet-paradise/ (rebuilt automatically on every push to `main`).

## Run it

```bash
npm install
npm run dev            # local dev server with hot reload
npm run build          # production build in dist/ (for Firebase Hosting later)
npm run build:artifact # single-file preview in dist-single/artifact.html
npm run typecheck
npm test               # generates hundreds of problems of every type and checks each one
npm run test:rules     # tests the Firestore security rules (needs Java; runs in GitHub Actions)
```

## How the code is organized

```
src/
  game/                 Game rules, no UI
    types.ts            Shapes of pets, looks and the saved game
    catalog.ts          Pets, rarities, eggs, needs, growth stages, wardrobe unlocks
    rules.ts            Pure functions: answering, feeding, growing, hatching, levels
    storage.ts          The GameStorage interface and the on-this-device save
    GameProvider.tsx    React context that connects the rules and storage to the UI
  math/
    types.ts            Question, QuestionType, Lesson and Zone types
    Figure.tsx          Draws grid diagrams from plain data
    shapes.ts           Builders for unit squares, boxes, prisms, pyramids and nets
    ratioDiagrams.ts    Builders for ratio diagrams, double number lines, tape diagrams, 10×10 grids
    fractions.ts        Exact fraction math, pretty fractions (7½, ²⁰⁄₃) and fraction bar diagrams
    dataDiagrams.ts     Number lines with negatives, inequality graphs, coordinate plane, dot plots, histograms, box plots
    units/
      index.ts          Registry of playable zones + the Grade 6 roadmap
      g6u1/             Unit 1: area, parallelograms, polygons, surface area
      g6u2/             Unit 2: ratios, double number lines, tables and tape diagrams
      g6u3/             Unit 3: measurement, unit rates, percentages
      g6u4/             Unit 4: meanings of division, dividing fractions, fraction geometry
      g6u5/             Unit 5: adding, multiplying and dividing decimals
      g6u6/             Unit 6: equations, expressions, exponents, relationships
      g6u7/             Unit 7: negatives, inequalities, coordinate plane, factors and multiples
      g6u8/             Unit 8: data displays, mean and MAD, median and box plots
      g6u9/             Unit 9: Fermi problems, voting, and the Grand Review
      questions.test.ts Checks every question generator (also runs before each deploy)
  pets/PetArt.tsx       Pet and egg drawings, colors and outfits
  components/           Yard, question sheet, hatching, panels, HUD
  fx/Fx.tsx             Confetti, flying coins, toasts
  account/              Family accounts: sign-in, invites, kid profiles, cloud saves (Firestore)
  firebase/             Firebase config and a lazy client (Firebase only downloads when someone signs in)
  Root.tsx              Chooses cloud or on-device saves and shows "Who's playing?"
  audio/music.ts        Original background music, synthesized live with the Web Audio API (no audio files)
```

### Adding a new unit or section

1. Create `src/math/units/g6uN/` with a questions file exporting `QuestionType[]` and a lessons file exporting `Lesson[]`. Copy a `g6u1` section as a template.
2. Register a `Zone` for each section in `src/math/units/index.ts`. It appears on the world map automatically.
3. Run `npm test`. Every new question type is checked automatically.

Each question type has an `unlockLevel` (the player level where it starts appearing) and a `make()` function that generates a fresh random problem. The game logic never needs to change to add math.

## Roadmap

- [x] **Phase 1: Foundation.** React + TypeScript. Animations (walking, blinking, hopping, egg cracking, flying coins). Growth-stage colors and outfits with a wardrobe.
- [x] **Phase 3: All of Grade 6.** All 9 units: 30 worlds on the world map, including a Grand Review that mixes every question type.
- [x] **Phase 2: Accounts.** Invitation-only parent accounts (email + password, confirmed email), kid profiles with optional PINs, cloud saves with offline support, and a password-protected family manager.
- [ ] **Phase 4: Friends and trading.** Friend codes, trade requests, two-sided confirmation, no free-text chat.
- [ ] **Phase 5: Trimathlons.** Timed competitions with family leaderboards.

## Family accounts (Phase 2)

- **Parents** sign in with email and password. Only emails listed in the Firestore `invites` collection can use the game's cloud features, and the email must be confirmed.
- **Kids** have no accounts, emails or passwords. They pick a profile on "Who's playing?", optionally protected by a 4-digit PIN (a sibling lock).
- **Saves** live in `families/{parentUid}/players/{playerId}` and work offline through Firestore's cache.
- **Without signing in**, the game saves on the device like before. The Claude preview build always works this way.

### Inviting a family

In the Firebase console: **Firestore Database → Data → `invites` → Add document**. Use the parent's email address in **lowercase** as the document ID, and add any field (for example `invitedAt`, type timestamp).

### Security rules

The rules are in `firestore.rules`. To publish them: **Firestore Database → Rules**, paste the file's contents, **Publish**. `npm run test:rules` tests them against the Firebase emulator, and GitHub Actions runs those tests on every push.

### A note on `npm audit`

`npm audit` flags `@grpc/grpc-js`, which Firebase uses only when it runs on a Node.js server. The browser build never includes it, so players aren't affected.

## Kids' privacy

Players are family and invited guests only. Phase 2 accounts will be created and managed by a parent. The app should not collect personal information from children beyond a display name, and social features stay limited to invited players.
