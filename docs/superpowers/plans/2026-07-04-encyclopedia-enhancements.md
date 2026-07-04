# Encyclopedia Enhancements (Favorites + Language Toggle) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add favoriting (star + dedicated "Favoritos" pill) and an EN/ES language toggle to the Enciclopedia tab, both persisted via `AppSettings`.

**Architecture:** Extend `AppSettings` with two new fields, load/save them through the existing `useTheme()` hook (which already owns the one sanctioned "read localStorage on mount" effect), author a new hand-translated Spanish content file for the 4 in-scope categories (conditions/actions/skills/spells), and restructure `EncyclopediaTab.tsx`'s item model to separate translatable prose from untranslated metadata.

**Tech Stack:** TypeScript, Next.js 15 (static export), no test framework — verification is `npx tsc --noEmit && npm run build && npm run lint` plus manual dev-server/browser checks per CLAUDE.md.

## Global Constraints

- `npm run lint` must report 0 errors.
- `output: 'export'` — no server-only APIs.
- Only `useCharacter.ts` and `useTheme.ts` may carry the `react-hooks/set-state-in-effect` eslint-disable for the localStorage-on-mount pattern — this plan extends `useTheme.ts`'s *existing* effect rather than adding a new one, so no new suppression is introduced.
- `src/data/translations-es.ts` is hand-authored, **not** produced by `scripts/extract-5etools.ts` (no Spanish source exists in `5etools-src`) — don't wire it into the extraction script.
- Translation style (validated against existing precedent in `migrations.ts`/`mavok-default.ts`/`SheetTab.tsx`): translate general mechanical adjectives and nouns (Advantage→Ventaja, Disadvantage→Desventaja, saving throw→salvación, Speed→Velocidad, Concentration→Concentración, Resistance→Resistencia, Immunity→Inmunidad), spell out ability scores in prose (Fuerza/Destreza/Constitución/Inteligencia/Sabiduría/Carisma). Keep in English: action-economy terms (Action, Bonus Action, Reaction), condition names when referenced (Prone, Incapacitated, Grappled, etc.), damage types (Bludgeoning, Fire, Acid...), area-effect shapes (Sphere, Cone, Cube, Line, Emanation), specific named things (weapons, spells, feats, monsters), and "Critical Hit". Names/titles of entries are never translated — only description prose.

---

### Task 1: Persist favorites and language preference via `AppSettings`

**Files:**
- Modify: `src/lib/types.ts` (`AppSettings` interface, ~line 154–158)
- Modify: `src/lib/storage.ts` (`loadSettings()` defaults, ~line 43–48)
- Modify: `src/hooks/useTheme.ts` (entire file, 41 lines)

**Interfaces:**
- Produces: `AppSettings.encyclopediaFavorites: string[]`, `AppSettings.encyclopediaLanguage: "en" | "es"`; `useTheme()` return value gains `encyclopediaFavorites: string[]`, `toggleFavorite: (id: string) => void`, `encyclopediaLanguage: "en" | "es"`, `setEncyclopediaLanguage: (lang: "en" | "es") => void`. Consumed via `useThemeContext()` (unchanged signature — `ThemeContextType = ReturnType<typeof useTheme>` picks up the new fields automatically).

- [ ] **Step 1: Add the two fields to `AppSettings`**

In `src/lib/types.ts`, replace:

```ts
export interface AppSettings {
  theme: "piedra-viva" | "dark-fantasy";
  lastCharacterId: string;
  density: "compact" | "spacious";
}
```

with:

```ts
export interface AppSettings {
  theme: "piedra-viva" | "dark-fantasy";
  lastCharacterId: string;
  density: "compact" | "spacious";
  encyclopediaFavorites: string[];
  encyclopediaLanguage: "en" | "es";
}
```

- [ ] **Step 2: Add defaults in `loadSettings()`**

In `src/lib/storage.ts`, replace:

```ts
export function loadSettings(): AppSettings {
  const defaults: AppSettings = {
    theme: "piedra-viva",
    lastCharacterId: "mavok-1",
    density: "spacious",
  };
```

with:

```ts
export function loadSettings(): AppSettings {
  const defaults: AppSettings = {
    theme: "piedra-viva",
    lastCharacterId: "mavok-1",
    density: "spacious",
    encyclopediaFavorites: [],
    encyclopediaLanguage: "en",
  };
```

(No other changes needed here — the existing `{ ...defaults, ...JSON.parse(raw) }` merge in the same function already backfills missing keys for settings blobs saved before this change.)

- [ ] **Step 3: Extend `useTheme()` with favorites and language state**

Replace the entire contents of `src/hooks/useTheme.ts` with:

```ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { loadSettings, saveSettings } from "@/lib/storage";
import type { AppSettings } from "@/lib/types";

export function useTheme() {
  const [theme, setTheme] = useState<AppSettings["theme"]>("piedra-viva");
  const [density, setDensity] = useState<AppSettings["density"]>("spacious");
  const [encyclopediaFavorites, setEncyclopediaFavorites] = useState<
    string[]
  >([]);
  const [encyclopediaLanguage, setEncyclopediaLanguageState] = useState<
    AppSettings["encyclopediaLanguage"]
  >("en");

  useEffect(() => {
    const settings = loadSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: localStorage is unavailable during the static-export build's prerender pass, so this read must be deferred to after client mount.
    setTheme(settings.theme);
    setDensity(settings.density);
    setEncyclopediaFavorites(settings.encyclopediaFavorites);
    setEncyclopediaLanguageState(settings.encyclopediaLanguage);
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next =
        prev === "piedra-viva" ? "dark-fantasy" : "piedra-viva";
      document.documentElement.setAttribute("data-theme", next);
      const settings = loadSettings();
      saveSettings({ ...settings, theme: next });
      return next;
    });
  }, []);

  const toggleDensity = useCallback(() => {
    setDensity((prev) => {
      const next = prev === "spacious" ? "compact" : "spacious";
      const settings = loadSettings();
      saveSettings({ ...settings, density: next });
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setEncyclopediaFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      const settings = loadSettings();
      saveSettings({ ...settings, encyclopediaFavorites: next });
      return next;
    });
  }, []);

  const setEncyclopediaLanguage = useCallback(
    (lang: AppSettings["encyclopediaLanguage"]) => {
      setEncyclopediaLanguageState(lang);
      const settings = loadSettings();
      saveSettings({ ...settings, encyclopediaLanguage: lang });
    },
    []
  );

  return {
    theme,
    toggleTheme,
    density,
    toggleDensity,
    encyclopediaFavorites,
    toggleFavorite,
    encyclopediaLanguage,
    setEncyclopediaLanguage,
  };
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts src/lib/storage.ts src/hooks/useTheme.ts
git commit -m "feat: persist encyclopedia favorites and language preference"
```

---

### Task 2: Author Spanish translations for conditions, actions, skills, and spells

**Files:**
- Create: `src/data/translations-es.ts`

**Interfaces:**
- Produces:
  ```ts
  export const CONDITIONS_ES: Record<string, string>; // 15 entries, keyed by Condition.name
  export const ACTIONS_ES: Record<string, string>; // 18 entries, keyed by ActionData.name
  export const SKILLS_ES: Record<string, string>; // 18 entries, keyed by SkillData.name
  export const SPELLS_ES: Record<string, string>; // 391 entries, keyed by SpellData.name
  ```
  Consumed by Task 3's `EncyclopediaTab.tsx`.

- [ ] **Step 1: Create the file with `CONDITIONS_ES`, `ACTIONS_ES`, and `SKILLS_ES` fully populated**

Create `src/data/translations-es.ts` with this exact content (translations for all 15 conditions from `src/data/conditions.ts`, all 18 actions from `src/data/actions.ts`, and all 18 skills from `src/data/skills-reference.ts` — each key is the English `name`, each value is the Spanish translation of that entry's `description`, following the style guide in Global Constraints above):

```ts
export const CONDITIONS_ES: Record<string, string> = {
  "Blinded": "Mientras tienes la condición Blinded, experimentas los siguientes efectos. **No puedes ver:** No puedes ver y fallas automáticamente cualquier prueba de habilidad que requiera vista. **Ataques afectados:** Las tiradas de ataque en tu contra tienen Ventaja, y tus tiradas de ataque tienen Desventaja.",
  "Charmed": "Mientras tienes la condición Charmed, experimentas los siguientes efectos. **No puedes dañar a quien te hechizó:** No puedes atacar a quien te hechizó ni elegirlo como objetivo de habilidades que causan daño o Efectos Mágicos. **Ventaja social:** Quien te hechizó tiene Ventaja en cualquier prueba de habilidad para interactuar contigo socialmente.",
  "Deafened": "Mientras tienes la condición Deafened, experimentas el siguiente efecto. **No puedes oír:** No puedes oír y fallas automáticamente cualquier prueba de habilidad que requiera oído.",
  "Exhaustion": "Mientras tienes la condición Exhaustion, experimentas los siguientes efectos. **Niveles de Exhaustion:** Esta condición es acumulativa. Cada vez que la recibes, ganas 1 nivel de Exhaustion. Mueres si tu nivel de Exhaustion llega a 6. **D20 Tests afectados:** Cuando haces un D20 Test, el resultado se reduce en 2 veces tu nivel de Exhaustion. **Velocidad reducida:** Tu Velocidad se reduce en una cantidad de pies igual a 5 veces tu nivel de Exhaustion. **Eliminar niveles de Exhaustion:** Terminar un descanso largo elimina 1 de tus niveles de Exhaustion. Cuando tu nivel de Exhaustion llega a 0, la condición termina.",
  "Frightened": "Mientras tienes la condición Frightened, experimentas los siguientes efectos. **Pruebas de habilidad y ataques afectados:** Tienes Desventaja en pruebas de habilidad y tiradas de ataque mientras la fuente del miedo esté a la vista. **No puedes acercarte:** No puedes moverte voluntariamente más cerca de la fuente del miedo.",
  "Grappled": "Mientras tienes la condición Grappled, experimentas los siguientes efectos. **Velocidad 0:** Tu Velocidad es 0 y no puede aumentar. **Ataques afectados:** Tienes Desventaja en tiradas de ataque contra cualquier objetivo que no sea quien te agarra. **Puedes ser movido:** Quien te agarra puede arrastrarte o cargarte cuando se mueve, pero cada pie de movimiento le cuesta 1 pie extra a menos que seas Tiny o dos o más categorías de tamaño más pequeño que él.",
  "Incapacitated": "Mientras tienes la condición Incapacitated, experimentas los siguientes efectos. **Inactivo:** No puedes realizar ninguna Action, Bonus Action o Reaction. **Sin concentración:** Se rompe tu Concentración. **Sin habla:** No puedes hablar. **Sorprendido:** Si estás Incapacitated cuando tiras Iniciativa, tienes Desventaja en la tirada.",
  "Invisible": "Mientras tienes la condición Invisible, experimentas los siguientes efectos. **Sorpresa:** Si estás Invisible cuando tiras Iniciativa, tienes Ventaja en la tirada. **Oculto:** No te afecta ningún efecto que requiera que su objetivo sea visto, a menos que quien creó el efecto pueda verte de alguna forma. Cualquier equipo que lleves puesto o cargues también está oculto. **Ataques afectados:** Las tiradas de ataque en tu contra tienen Desventaja, y tus tiradas de ataque tienen Ventaja. Si una criatura puede verte de alguna forma, no obtienes este beneficio contra esa criatura.",
  "Paralyzed": "Mientras tienes la condición Paralyzed, experimentas los siguientes efectos. **Incapacitated:** Tienes la condición Incapacitated. **Velocidad 0:** Tu Velocidad es 0 y no puede aumentar. **Salvaciones afectadas:** Fallas automáticamente las salvaciones de Fuerza y Destreza. **Ataques afectados:** Las tiradas de ataque en tu contra tienen Ventaja. **Golpes críticos automáticos:** Cualquier tirada de ataque que te impacte es un Critical Hit si el atacante está a 5 pies o menos de ti.",
  "Petrified": "Mientras tienes la condición Petrified, experimentas los siguientes efectos. **Transformado en sustancia inanimada:** Te transformas, junto con cualquier objeto no mágico que lleves puesto o cargues, en una sustancia sólida e inanimada (normalmente piedra). Tu peso aumenta por un factor de diez, y dejas de envejecer. **Incapacitated:** Tienes la condición Incapacitated. **Velocidad 0:** Tu Velocidad es 0 y no puede aumentar. **Ataques afectados:** Las tiradas de ataque en tu contra tienen Ventaja. **Salvaciones afectadas:** Fallas automáticamente las salvaciones de Fuerza y Destreza. **Resistencia a daño:** Tienes Resistencia a todo el daño. **Inmunidad a veneno:** Tienes Inmunidad a la condición Poisoned.",
  "Poisoned": "Mientras tienes la condición Poisoned, experimentas el siguiente efecto. **Pruebas de habilidad y ataques afectados:** Tienes Desventaja en tiradas de ataque y pruebas de habilidad.",
  "Prone": "Mientras tienes la condición Prone, experimentas los siguientes efectos. **Movimiento restringido:** Tus únicas opciones de movimiento son Crawling o gastar una cantidad de movimiento igual a la mitad de tu Velocidad (redondeando hacia abajo) para levantarte y así terminar la condición. Si tu Velocidad es 0, no puedes levantarte. **Ataques afectados:** Tienes Desventaja en tiradas de ataque. Una tirada de ataque en tu contra tiene Ventaja si el atacante está a 5 pies o menos de ti. De lo contrario, esa tirada de ataque tiene Desventaja.",
  "Restrained": "Mientras tienes la condición Restrained, experimentas los siguientes efectos. **Velocidad 0:** Tu Velocidad es 0 y no puede aumentar. **Ataques afectados:** Las tiradas de ataque en tu contra tienen Ventaja, y tus tiradas de ataque tienen Desventaja. **Salvaciones afectadas:** Tienes Desventaja en la salvación de Destreza.",
  "Stunned": "Mientras tienes la condición Stunned, experimentas los siguientes efectos. **Incapacitated:** Tienes la condición Incapacitated. **Salvaciones afectadas:** Fallas automáticamente las salvaciones de Fuerza y Destreza. **Ataques afectados:** Las tiradas de ataque en tu contra tienen Ventaja.",
  "Unconscious": "Mientras tienes la condición Unconscious, experimentas los siguientes efectos. **Inerte:** Tienes las condiciones Incapacitated y Prone, y sueltas todo lo que llevas en las manos. Cuando esta condición termina, permaneces Prone. **Velocidad 0:** Tu Velocidad es 0 y no puede aumentar. **Ataques afectados:** Las tiradas de ataque en tu contra tienen Ventaja. **Salvaciones afectadas:** Fallas automáticamente las salvaciones de Fuerza y Destreza. **Golpes críticos automáticos:** Cualquier tirada de ataque que te impacte es un Critical Hit si el atacante está a 5 pies o menos de ti. **Inconsciente de tu entorno:** No percibes lo que ocurre a tu alrededor.",
};

export const ACTIONS_ES: Record<string, string> = {
  "Attack": "Cuando realizas la acción Attack, puedes hacer una tirada de ataque con un arma o un Unarmed Strike. **Equipar y desequipar armas:** Puedes equipar o desequipar un arma cuando haces un ataque como parte de esta acción. Puedes hacerlo antes o después del ataque. Si equipas un arma antes de un ataque, no es necesario usarla para ese ataque. Equipar un arma incluye desenvainarla o recogerla. Desequipar un arma incluye envainarla, guardarla o soltarla. **Moverte entre ataques:** Si te mueves en tu turno y tienes una característica, como Extra Attack, que te da más de un ataque como parte de la acción Attack, puedes usar parte o todo ese movimiento para moverte entre esos ataques.",
  "Dash": "Cuando realizas la acción Dash, obtienes movimiento extra para el turno actual. El aumento es igual a tu Velocidad después de aplicar cualquier modificador. Con una Velocidad de 30 pies, por ejemplo, puedes moverte hasta 60 pies en tu turno si haces Dash. Si tu Velocidad de 30 pies se reduce a 15 pies, puedes moverte hasta 30 pies este turno si haces Dash. Si tienes una velocidad especial, como una Fly Speed o Swim Speed, puedes usar esa velocidad en lugar de tu Velocidad cuando realizas esta acción. Eliges qué velocidad usar cada vez que la realizas.",
  "Disengage": "Si realizas la acción Disengage, tu movimiento no provoca Opportunity Attack por el resto del turno actual.",
  "Dodge": "Si realizas la acción Dodge, obtienes los siguientes beneficios: hasta el inicio de tu siguiente turno, cualquier tirada de ataque en tu contra tiene Desventaja si puedes ver al atacante, y haces las salvaciones de Destreza con Ventaja. Pierdes estos beneficios si tienes la condición Incapacitated o si tu Velocidad es 0.",
  "Don or Doff a Shield": "Un Shield puede ser equipado o quitado como una acción.",
  "End Concentration": "Algunos hechizos y otros efectos requieren Concentración para permanecer activos, según se especifica en sus descripciones. Puedes terminar la Concentración en cualquier momento (sin necesidad de una acción).",
  "Escape a Grapple": "Una criatura Grappled puede usar su acción para hacer una prueba de Fuerza (Athletics) o Destreza (Acrobatics) contra la DC de escape del agarre, terminando la condición en sí misma si tiene éxito. La condición también termina si quien agarra tiene la condición Incapacitated o si la distancia entre el objetivo Grappled y quien agarra excede el alcance del agarre.",
  "Help": "Cuando realizas la acción Help, haces una de las siguientes cosas. **Ayudar en una prueba de habilidad:** Elige una de tus competencias en habilidad o herramienta y un aliado que esté lo bastante cerca para que lo asistas verbal o físicamente cuando haga una prueba de habilidad. Ese aliado tiene Ventaja en la siguiente prueba de habilidad que haga con la habilidad o herramienta elegida. Este beneficio expira si el aliado no lo usa antes del inicio de tu siguiente turno. El DM tiene la última palabra sobre si tu ayuda es posible. **Ayudar en una tirada de ataque:** Distraes momentáneamente a un enemigo a 5 pies o menos de ti, dando Ventaja a la siguiente tirada de ataque de uno de tus aliados contra ese enemigo. Este beneficio expira al inicio de tu siguiente turno. Además, la acción Help puede usarse para estabilizar a una criatura.",
  "Hide": "Con la acción Hide, intentas ocultarte. Para hacerlo, debes tener éxito en una prueba de Destreza (Stealth) DC 15 mientras estás Heavily Obscured o detrás de Cover, y debes estar fuera de la línea de visión de cualquier enemigo; si puedes ver a una criatura, puedes discernir si ella puede verte a ti. Si la prueba tiene éxito, tienes la condición Invisible mientras estés oculto. Anota el resultado total de tu prueba, que es la DC para que una criatura te encuentre con una prueba de Sabiduría (Perception). Dejas de estar oculto inmediatamente después de que ocurra cualquiera de lo siguiente: haces un sonido más fuerte que un susurro, un enemigo te encuentra, haces una tirada de ataque, o lanzas un hechizo con un componente Verbal.",
  "Improvising an Action": "Los personajes jugadores y los monstruos también pueden hacer cosas no cubiertas por otras acciones. Muchas características de clase y otras habilidades ofrecen opciones de acción adicionales, y puedes improvisar otras acciones. Cuando describes una acción no detallada en otra parte de las reglas, el Dungeon Master te dice si esa acción es posible y qué tipo de D20 Test necesitas hacer, si es que se requiere alguno.",
  "Influence": "Con la acción Influence, instas a un monstruo a hacer algo. Describe o interpreta cómo te estás comunicando con el monstruo. ¿Estás intentando engañar, intimidar, divertir o persuadir con delicadeza? El DM entonces determina si el monstruo se siente dispuesto, no dispuesto o dudoso debido a tu interacción; esta determinación establece si es necesaria una prueba de habilidad, como se explica a continuación. **Dispuesto:** Si tu petición coincide con los deseos del monstruo, no es necesaria ninguna prueba de habilidad; el monstruo cumple tu petición de la forma que prefiera. **No dispuesto:** Si tu petición resulta repugnante para el monstruo o contraria a su alineamiento, no es necesaria ninguna prueba de habilidad; no accede. **Dudoso:** Si instas al monstruo a hacer algo que le genera dudas, debes hacer una prueba de habilidad, que se ve afectada por la actitud del monstruo: Indifferent, Friendly o Hostile, cada una definida en este glosario. La tabla Influence Checks sugiere qué prueba de habilidad hacer según cómo estés interactuando con el monstruo. El DM elige la prueba, que tiene una DC por defecto igual a 15 o la puntuación de Inteligencia del monstruo, la que sea mayor. Si la prueba tiene éxito, el monstruo hace lo que se le pidió. Si falla, debes esperar 24 horas (o la duración que fije el DM) antes de instarlo de la misma forma otra vez.",
  "Magic": "Cuando realizas la acción Magic, lanzas un hechizo que tiene un tiempo de lanzamiento de una acción, o usas una característica u objeto mágico que requiere una acción Magic para activarse. Si lanzas un hechizo que tiene un tiempo de lanzamiento de 1 minuto o más, debes realizar la acción Magic en cada turno de ese lanzamiento, y debes mantener la Concentración mientras lo haces. Si tu Concentración se rompe, el hechizo falla, pero no gastas un espacio de hechizo.",
  "Opportunity Attack": "Puedes hacer un Opportunity Attack cuando una criatura que puedes ver abandona tu alcance usando su acción, su Bonus Action, su Reaction, o una de sus velocidades. Para hacer el Opportunity Attack, usa una Reaction para hacer un ataque cuerpo a cuerpo con un arma o un Unarmed Strike contra la criatura que provoca. El ataque ocurre justo antes de que la criatura abandone tu alcance.",
  "Ready": "Realizas la acción Ready para esperar una circunstancia particular antes de actuar. Para hacerlo, realizas esta acción en tu turno, lo que te permite actuar usando una Reaction antes del inicio de tu siguiente turno. Primero, decides qué circunstancia perceptible activará tu Reaction. Luego, eliges la acción que realizarás en respuesta a ese disparador, o eliges moverte hasta tu Velocidad en respuesta a él. Algunos ejemplos son \"Si el cultista pisa la trampilla, tiraré de la palanca que la abre\" y \"Si el zombi se pone a mi lado, me alejo\". Cuando ocurre el disparador, puedes realizar tu Reaction justo después de que termine el disparador o ignorarlo. Cuando preparas un hechizo con Ready, lo lanzas normalmente (gastando cualquier recurso usado para lanzarlo) pero retienes su energía, que liberas con tu Reaction cuando ocurre el disparador. Para poder prepararse, un hechizo debe tener un tiempo de lanzamiento de una acción, y mantener la magia del hechizo requiere Concentración, que puedes mantener hasta el inicio de tu siguiente turno. Si tu Concentración se rompe, el hechizo se disipa sin efecto.",
  "Search": "Cuando realizas la acción Search, haces una prueba de Sabiduría para percibir algo que no es obvio. La tabla Search sugiere qué habilidades son aplicables cuando realizas esta acción, dependiendo de lo que intentes detectar.",
  "Study": "Cuando realizas la acción Study, haces una prueba de Inteligencia para estudiar tu memoria, un libro, una pista u otra fuente de conocimiento y recordar un dato importante sobre ella. La tabla Areas of Knowledge sugiere qué habilidades son aplicables a varias áreas de conocimiento.",
  "Two-Weapon Fighting": "Cuando realizas la acción Attack en tu turno y atacas con un arma Light, puedes hacer un ataque extra como Bonus Action más adelante en el mismo turno. Ese ataque extra debe hacerse con un arma Light diferente, y no sumas tu modificador de habilidad al daño del ataque extra a menos que ese modificador sea negativo. Por ejemplo, puedes atacar con una Shortsword en una mano y una Dagger en la otra usando la acción Attack y una Bonus Action, pero no sumas tu modificador de Fuerza o Destreza al daño de la Bonus Action a menos que ese modificador sea negativo.",
  "Utilize": "Normalmente interactúas con un objeto mientras haces otra cosa, como cuando desenvainas una espada como parte de la acción Attack. Cuando un objeto requiere una acción para su uso, realizas la acción Utilize.",
};

export const SKILLS_ES: Record<string, string> = {
  "Acrobatics": "Mantente en pie en una situación complicada, o realiza una acrobacia.",
  "Animal Handling": "Calma o entrena a un animal, o consigue que un animal se comporte de cierta manera.",
  "Arcana": "Recuerda conocimientos sobre hechizos, objetos mágicos y los planos de existencia.",
  "Athletics": "Salta más lejos de lo normal, mantente a flote en aguas agitadas, o rompe algo.",
  "Deception": "Cuenta una mentira convincente, o lleva un disfraz de forma convincente.",
  "History": "Recuerda conocimientos sobre eventos históricos, personas, naciones y culturas.",
  "Insight": "Discierne el estado de ánimo e intenciones de una persona.",
  "Intimidation": "Impresiona o amenaza a alguien para que haga lo que quieres.",
  "Investigation": "Encuentra información oscura en libros, o deduce cómo funciona algo.",
  "Medicine": "Diagnostica una enfermedad, o determina qué mató a alguien recién fallecido.",
  "Nature": "Recuerda conocimientos sobre terreno, plantas, animales y clima.",
  "Perception": "Usando una combinación de sentidos, percibe algo que es fácil pasar por alto.",
  "Performance": "Actúa, cuenta una historia, interpreta música, o baila.",
  "Persuasion": "Convence a alguien de algo con honestidad y gentileza.",
  "Religion": "Recuerda conocimientos sobre dioses, rituales religiosos y símbolos sagrados.",
  "Sleight of Hand": "Roba de un bolsillo, oculta un objeto pequeño, o realiza juegos de manos.",
  "Stealth": "Pasa desapercibido moviéndote con sigilo y ocultándote detrás de cosas.",
  "Survival": "Sigue huellas, busca alimento, encuentra un rastro, o evita peligros naturales.",
};

export const SPELLS_ES: Record<string, string> = {};
```

- [ ] **Step 2: Verify conditions/actions/skills counts**

Run:
```bash
node -e "
const fs = require('fs');
const src = fs.readFileSync('src/data/translations-es.ts', 'utf-8');
const countKeys = (name) => {
  const m = src.match(new RegExp(name + ': Record<string, string> = \\\\{([\\\\s\\\\S]*?)\\\\n\\\\};'));
  return (m[1].match(/^  \"/gm) || []).length;
};
console.log('CONDITIONS_ES:', countKeys('CONDITIONS_ES'));
console.log('ACTIONS_ES:', countKeys('ACTIONS_ES'));
console.log('SKILLS_ES:', countKeys('SKILLS_ES'));
"
```
Expected: `CONDITIONS_ES: 15`, `ACTIONS_ES: 18`, `SKILLS_ES: 18`.

- [ ] **Step 3: Populate `SPELLS_ES` with all 391 spell translations**

Replace the placeholder `export const SPELLS_ES: Record<string, string> = {};` with a fully populated map. For every entry in `SPELLS` (`src/data/spells.ts`), translate its `description` field into Spanish following the exact style guide used for `CONDITIONS_ES`/`ACTIONS_ES`/`SKILLS_ES` above (translate general mechanical adjectives — Advantage/Disadvantage/saving throw/Speed/Concentration/Resistance/Immunity — spell out ability scores in prose, keep Action/Bonus Action/Reaction/condition names/damage types/area shapes/Critical Hit/proper names in English). Key each entry by the spell's exact `name` field. This is generated directly in this step given its volume (391 entries) — there is no shortcut around authoring the actual translated text.

- [ ] **Step 4: Verify spell count and type-check**

Run:
```bash
node -e "
const fs = require('fs');
const src = fs.readFileSync('src/data/translations-es.ts', 'utf-8');
const m = src.match(/SPELLS_ES: Record<string, string> = \{([\s\S]*)\};\s*$/);
console.log('SPELLS_ES:', (m[1].match(/^  \"/gm) || []).length);
"
npx tsc --noEmit
```
Expected: `SPELLS_ES: 391`, and `tsc` reports no errors.

- [ ] **Step 5: Commit**

```bash
git add src/data/translations-es.ts
git commit -m "feat: author Spanish translations for conditions, actions, skills, and spells"
```

---

### Task 3: Wire favorites and language toggle into EncyclopediaTab

**Files:**
- Modify: `src/components/tabs/EncyclopediaTab.tsx` (entire file, 277 lines)

**Interfaces:**
- Consumes: `useThemeContext()` (Task 1: `encyclopediaFavorites`, `toggleFavorite`, `encyclopediaLanguage`, `setEncyclopediaLanguage`); `CONDITIONS_ES`/`ACTIONS_ES`/`SKILLS_ES`/`SPELLS_ES` (Task 2, `src/data/translations-es.ts`).
- Produces: no new exports — final integration point.

- [ ] **Step 1: Restructure `EncyclopediaItem` to separate header metadata from translatable description**

In `src/components/tabs/EncyclopediaTab.tsx`, replace the imports and `EncyclopediaItem` interface (lines 1–37) with:

```tsx
"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useThemeContext } from "@/lib/context";
import { CONDITIONS } from "@/data/conditions";
import { ACTIONS } from "@/data/actions";
import { SKILLS_REFERENCE } from "@/data/skills-reference";
import { WEAPONS } from "@/data/weapons";
import { ARMOR } from "@/data/armor";
import { GEAR } from "@/data/gear";
import { MASTERY_PROPERTIES } from "@/data/mastery";
import { FEATS } from "@/data/feats";
import { SPELLS } from "@/data/spells";
import {
  CONDITIONS_ES,
  ACTIONS_ES,
  SKILLS_ES,
  SPELLS_ES,
} from "@/data/translations-es";
import { abilityLabel } from "@/lib/utils";
import type { AbilityScore } from "@/lib/types";

const CATEGORIES = [
  { id: "conditions", label: "Condiciones" },
  { id: "actions", label: "Acciones" },
  { id: "skills", label: "Habilidades" },
  { id: "weapons", label: "Armas" },
  { id: "armor", label: "Armaduras" },
  { id: "gear", label: "Equipo" },
  { id: "mastery", label: "Maestrías" },
  { id: "feats", label: "Dotes" },
  { id: "spells", label: "Hechizos" },
] as const;

type Category = (typeof CATEGORIES)[number]["id"];

const FAVORITES_ID = "favorites" as const;

const PILLS: { id: Category | typeof FAVORITES_ID; label: string }[] = [
  { id: FAVORITES_ID, label: "Favoritos" },
  ...CATEGORIES,
];

const TRANSLATIONS: Partial<Record<Category, Record<string, string>>> = {
  conditions: CONDITIONS_ES,
  actions: ACTIONS_ES,
  skills: SKILLS_ES,
  spells: SPELLS_ES,
};

const TRANSLATION_DISCLAIMER =
  "Traducción no oficial — verifica en inglés si hay dudas.";

interface EncyclopediaItem {
  id: string;
  category: Category;
  name: string;
  hint: string;
  header: string;
  description: string;
}

function resolveDetail(
  item: EncyclopediaItem,
  language: "en" | "es"
): string {
  const translations = TRANSLATIONS[item.category];
  const translated = language === "es" ? translations?.[item.name] : undefined;
  const body = translated
    ? `${TRANSLATION_DISCLAIMER}\n\n${translated}`
    : item.description;
  return [item.header, body].filter(Boolean).join("\n\n");
}
```

- [ ] **Step 2: Update the 9 item-builder functions to produce `header`/`description` instead of one combined `detail`**

Replace the block from `function buildConditionItems()` through the closing brace of `CATEGORY_ITEMS` (originally lines 39–174) with:

```tsx
function buildConditionItems(): EncyclopediaItem[] {
  return CONDITIONS.map((c) => ({
    id: `conditions-${c.name}`,
    category: "conditions",
    name: c.name,
    hint: "",
    header: "",
    description: c.description,
  }));
}

function buildActionItems(): EncyclopediaItem[] {
  return ACTIONS.map((a) => ({
    id: `actions-${a.name}`,
    category: "actions",
    name: a.name,
    hint: "",
    header: "",
    description: a.description,
  }));
}

function buildSkillItems(): EncyclopediaItem[] {
  return SKILLS_REFERENCE.map((s) => ({
    id: `skills-${s.name}`,
    category: "skills",
    name: s.name,
    hint: abilityLabel(s.ability as AbilityScore),
    header: "",
    description: s.description,
  }));
}

function buildWeaponItems(): EncyclopediaItem[] {
  return WEAPONS.map((w) => ({
    id: `weapons-${w.name}`,
    category: "weapons",
    name: w.name,
    hint: `${w.damage} ${w.damageType}`,
    header: [
      `${w.type === "melee" ? "Cuerpo a cuerpo" : "A distancia"} · ${w.category}`,
      `Daño: ${w.damage} ${w.damageType}`,
      w.range ? `Alcance: ${w.range}` : null,
      `Peso: ${w.weight} lb${w.value !== null ? ` · Valor: ${w.value} gp` : ""}`,
      `Propiedades: ${w.properties.length ? w.properties.join(", ") : "Ninguna"}`,
      w.mastery ? `Maestría: ${w.mastery}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    description: "",
  }));
}

function buildArmorItems(): EncyclopediaItem[] {
  return ARMOR.map((a) => ({
    id: `armor-${a.name}`,
    category: "armor",
    name: a.name,
    hint: `AC ${a.ac}`,
    header: [
      `Tipo: ${a.type}`,
      `CA: ${a.ac}`,
      `Peso: ${a.weight} lb${a.value !== null ? ` · Valor: ${a.value} gp` : ""}`,
      a.stealthDisadvantage ? "Desventaja en Sigilo" : null,
      a.strengthRequirement ? `Requiere FUE ${a.strengthRequirement}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    description: "",
  }));
}

function buildGearItems(): EncyclopediaItem[] {
  return GEAR.map((g) => ({
    id: `gear-${g.name}`,
    category: "gear",
    name: g.name,
    hint: g.value !== null ? `${g.value} gp` : "",
    header: "",
    description: g.description,
  }));
}

function buildMasteryItems(): EncyclopediaItem[] {
  return MASTERY_PROPERTIES.map((m) => ({
    id: `mastery-${m.name}`,
    category: "mastery",
    name: m.name,
    hint: "",
    header: "",
    description: m.description,
  }));
}

function buildFeatItems(): EncyclopediaItem[] {
  return FEATS.map((f) => ({
    id: `feats-${f.name}`,
    category: "feats",
    name: f.name,
    hint: f.category,
    header: [
      f.category,
      f.levelRequired ? `Nivel ${f.levelRequired}` : null,
      f.repeatable ? "Repetible" : null,
    ]
      .filter(Boolean)
      .join(" · "),
    description: f.description,
  }));
}

function buildSpellItems(): EncyclopediaItem[] {
  return SPELLS.map((s) => ({
    id: `spells-${s.name}`,
    category: "spells",
    name: s.name,
    hint: `${s.level === 0 ? "Cantrip" : `Nv. ${s.level}`} · ${s.school}`,
    header: [
      `${s.level === 0 ? "Cantrip" : `Nivel ${s.level}`} · ${s.school}${s.ritual ? " (Ritual)" : ""}`,
      `Tiempo de lanzamiento: ${s.castingTime}`,
      `Alcance: ${s.range}`,
      `Componentes: ${s.components}`,
      `Duración: ${s.duration}${s.concentration ? " (Concentración)" : ""}`,
    ].join("\n"),
    description: s.description,
  }));
}

const CATEGORY_ITEMS: Record<Category, () => EncyclopediaItem[]> = {
  conditions: buildConditionItems,
  actions: buildActionItems,
  skills: buildSkillItems,
  weapons: buildWeaponItems,
  armor: buildArmorItems,
  gear: buildGearItems,
  mastery: buildMasteryItems,
  feats: buildFeatItems,
  spells: buildSpellItems,
};
```

- [ ] **Step 3: Rewrite the `EncyclopediaTab` component**

Replace the rest of the file (from `export function EncyclopediaTab()` to the end) with:

```tsx
export function EncyclopediaTab() {
  const {
    encyclopediaFavorites,
    toggleFavorite,
    encyclopediaLanguage,
    setEncyclopediaLanguage,
  } = useThemeContext();
  const [activeCategory, setActiveCategory] = useState<
    Category | typeof FAVORITES_ID
  >("conditions");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingItem, setViewingItem] = useState<EncyclopediaItem | null>(null);

  const allItems = useMemo(
    () => CATEGORIES.flatMap((c) => CATEGORY_ITEMS[c.id]()),
    []
  );
  const categoryItems = useMemo(
    () =>
      activeCategory === FAVORITES_ID ? [] : CATEGORY_ITEMS[activeCategory](),
    [activeCategory]
  );
  const favoriteItems = useMemo(
    () => allItems.filter((item) => encyclopediaFavorites.includes(item.id)),
    [allItems, encyclopediaFavorites]
  );

  const searchResults = searchQuery
    ? allItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  function renderRow(item: EncyclopediaItem, showCategoryBadge: boolean) {
    const isFavorite = encyclopediaFavorites.includes(item.id);
    return (
      <div
        key={item.id}
        onClick={() => setViewingItem(item)}
        className="stone-card rounded-lg p-3 cursor-pointer active:scale-[0.99] transition-transform flex items-center gap-2"
      >
        {showCategoryBadge && (
          <span className="text-[0.6rem] px-1.5 py-0.5 bg-accent/20 text-accent rounded shrink-0">
            {CATEGORIES.find((c) => c.id === item.category)?.label}
          </span>
        )}
        <span className="text-sm truncate flex-1">{item.name}</span>
        {item.hint && (
          <span className="text-muted text-xs shrink-0">{item.hint}</span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
          className="shrink-0 text-accent"
        >
          <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar + language toggle */}
      <div className="p-2 border-b border-border bg-card shrink-0 flex gap-2 items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en la enciclopedia..."
          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
        />
        <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
          <button
            onClick={() => setEncyclopediaLanguage("en")}
            className={`px-2 py-2 text-xs font-heading ${
              encyclopediaLanguage === "en"
                ? "bg-accent text-white"
                : "text-muted"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setEncyclopediaLanguage("es")}
            className={`px-2 py-2 text-xs font-heading ${
              encyclopediaLanguage === "es"
                ? "bg-accent text-white"
                : "text-muted"
            }`}
          >
            ES
          </button>
        </div>
      </div>

      {/* Category navigation (hidden while searching) */}
      {!searchQuery && (
        <div className="flex overflow-x-auto border-b border-border bg-card px-2 gap-1 shrink-0">
          {PILLS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-2.5 text-xs whitespace-nowrap transition-colors border-b-2 ${
                activeCategory === tab.id
                  ? "text-accent border-accent"
                  : "text-muted border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {searchQuery ? (
          searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((item) => renderRow(item, true))}
            </div>
          ) : (
            <p className="text-muted text-sm text-center py-8">
              Sin resultados para &quot;{searchQuery}&quot;.
            </p>
          )
        ) : activeCategory === FAVORITES_ID ? (
          favoriteItems.length > 0 ? (
            <div className="space-y-2">
              {favoriteItems.map((item) => renderRow(item, true))}
            </div>
          ) : (
            <p className="text-muted text-sm text-center py-8">
              Aún no tienes favoritos — toca la estrella en cualquier
              entrada.
            </p>
          )
        ) : (
          <div className="space-y-2">
            {categoryItems.map((item) => renderRow(item, false))}
          </div>
        )}
      </div>

      <Modal
        open={viewingItem !== null}
        onClose={() => setViewingItem(null)}
        title={viewingItem?.name ?? ""}
      >
        {viewingItem && (
          <>
            <button
              onClick={() => toggleFavorite(viewingItem.id)}
              className="flex items-center gap-1.5 text-xs text-accent mb-3"
            >
              <Star
                size={16}
                fill={
                  encyclopediaFavorites.includes(viewingItem.id)
                    ? "currentColor"
                    : "none"
                }
              />
              {encyclopediaFavorites.includes(viewingItem.id)
                ? "En favoritos"
                : "Agregar a favoritos"}
            </button>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {resolveDetail(viewingItem, encyclopediaLanguage)}
            </p>
          </>
        )}
      </Modal>
    </div>
  );
}
```

- [ ] **Step 4: Type-check, build, lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: build succeeds, lint reports 0 errors (the pre-existing `@next/next/no-img-element` warnings in `SettingsTab.tsx`/`SheetTab.tsx` are unrelated and expected to remain).

- [ ] **Step 5: Manual browser verification**

Start the dev server and drive it with a real browser (headless Chromium or manual) per CLAUDE.md's UI-testing requirement:

```bash
npm run dev &
echo $! > /tmp/mavok-dev.pid
until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done
```

Verify:
- Open Enciclopedia, star 2-3 items across different categories (e.g. a spell, a condition), confirm the star fills in immediately on the row and in the detail modal.
- Switch to the "Favoritos" pill — confirm exactly the starred items appear, each with the correct category badge.
- Reload the page — confirm favorites persist (still starred, still in the Favoritos pill).
- Toggle to "ES" — open a spell, condition, action, and skill detail modal; confirm each shows the disclaimer line followed by Spanish text, while the header metadata (level/school/casting time/etc.) stays in English/unchanged.
- With "ES" still active, open a weapon or armor detail modal — confirm it shows English text with no disclaimer (untranslated category, toggle has no effect).
- Toggle back to "EN" — confirm all modals revert to English with no disclaimer.
- Check the browser console for errors — expect none.

Stop the dev server when done:
```bash
kill "$(cat /tmp/mavok-dev.pid)"
```

- [ ] **Step 6: Commit**

```bash
git add src/components/tabs/EncyclopediaTab.tsx public/sw.js
git commit -m "feat: add favorites and EN/ES language toggle to EncyclopediaTab"
```

(`public/sw.js` is regenerated by the `prebuild` script during `npm run build` in Step 4 — commit it alongside per the project's established convention.)

---

## Self-Review Notes

- **Spec coverage:** Persistence (Task 1) ✅, translation content for the 4 in-scope categories (Task 2) ✅, favorites UI + Favoritos pill + language toggle + disclaimer + untranslated-category passthrough (Task 3) ✅. Out-of-scope items from the spec (no translation of names, no favorites ordering UI, no `Character`/migration changes) are honored — everything lives in `AppSettings` and `EncyclopediaTab.tsx`.
- **Type consistency:** `EncyclopediaItem` (`id`, `category`, `name`, `hint`, `header`, `description`) used consistently across all 9 builders and `resolveDetail`. `Category | typeof FAVORITES_ID` used consistently for `activeCategory` state and `PILLS`. `useTheme()`'s new return fields (`encyclopediaFavorites`, `toggleFavorite`, `encyclopediaLanguage`, `setEncyclopediaLanguage`) match exactly between Task 1's definition and Task 3's consumption via `useThemeContext()`.
- **No placeholders:** Task 2's `SPELLS_ES` starts as `{}` and Step 3 explicitly instructs generating all 391 entries with the same style guide already demonstrated in full for the other 3 categories — this is a deliberate, disclosed exception (flagged in the spec) given 391 entries can't be reasonably pre-printed in a planning document; every other step has complete, literal code.
