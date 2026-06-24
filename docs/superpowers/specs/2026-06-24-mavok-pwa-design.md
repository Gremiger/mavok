# Mavok PWA — Design Spec

## Overview

A phone-first PWA for managing Mavok ToroDeCasa Toduk-Rojum's D&D 5.5e (2024 rules) character. Covers character sheet, combat, inventory, notes, and level-up. All data in LocalStorage, deployed to Vercel as a static export.

**Language**: Spanish UI, English D&D terms where standard (Rage, Perception, etc.).

## Tech Stack

- **Framework**: Next.js 15 with `output: 'export'` (static site)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS + CSS custom properties for theming
- **Data**: LocalStorage (JSON per character)
- **PWA**: Service worker + manifest.json, offline-capable, installable
- **Typography**: Cinzel (headers), Inter (body)
- **No database, no auth, no backend**

## Architecture

Single-page app with a fixed bottom tab bar (5 tabs). All state managed via a custom React hook (`useCharacter`) wrapping LocalStorage. Static export means no SSR — everything runs client-side.

### Project Structure

```
src/
  app/
    layout.tsx          # Shell: header + bottom tab bar
    page.tsx            # Default view (Ficha tab)
  components/
    tabs/
      SheetTab.tsx      # Character sheet / identity
      CombatTab.tsx     # Combat actions and state
      InventoryTab.tsx  # Equipment and currency
      NotesTab.tsx      # All note types
      SettingsTab.tsx   # Config, rest, import/export
    sheet/              # Ficha sub-components
    combat/             # Combat sub-components
    inventory/          # Inventory sub-components
    notes/              # Notes sub-components
    ui/                 # Shared UI (buttons, modals, cards)
  lib/
    storage.ts          # LocalStorage wrapper with auto-save
    types.ts            # TypeScript interfaces
    barbarian.ts        # Barbarian class progression (all 20 levels)
    berserker.ts        # Path of the Berserker subclass data
    goliath.ts          # Goliath species features
    constants.ts        # D&D 5.5e constants (conditions, skills, etc.)
    dice.ts             # Dice rolling logic
  hooks/
    useCharacter.ts     # Main character state hook
    useTheme.ts         # Theme toggle hook
public/
  manifest.json
  icons/               # PWA icons
  sw.js                # Service worker
```

## Data Model

Single JSON object per character in LocalStorage. Key format: `mavok_character_<id>`.

```typescript
interface Character {
  id: string;
  meta: {
    name: string;
    level: number;
    class: string;
    subclass: string | null;
    species: string;
    giantAncestry: string;
    background: string;
    originFeat: string;
    origin: string;
    age: number;
    proficiencyBonus: number;
    inspiration: boolean;
  };

  attributes: {
    str: number; dex: number; con: number;
    int: number; wis: number; cha: number;
  };

  combat: {
    maxHp: number;
    currentHp: number;
    tempHp: number;
    armorClass: number;
    initiative: number;
    speed: number;
    passivePerception: number;
    hitDice: { total: number; remaining: number; die: string; };
    deathSaves: { successes: number; failures: number; };
    conditions: string[];
  };

  resources: {
    rpiRages: { total: number; remaining: number; active: boolean; };
    healerKit: { total: number; remaining: number; };
  };

  savingThrows: Record<string, { proficient: boolean; }>;
  skills: Record<string, { attribute: string; proficient: boolean; }>;

  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: string[];
  };

  features: Array<{
    name: string;
    source: string;
    description: string;
    level: number;
  }>;

  attacks: Array<{
    name: string;
    attackBonus: number;
    damage: string;
    damageType: string;
    range: string;
    properties: string[];
    mastery: string | null;
    masteryEffect: string | null;
    masterySaveDC: number | null;
  }>;

  inventory: Array<{
    id: string;
    name: string;
    quantity: number;
    weight: number | null;
    category: "weapon" | "armor" | "gear" | "consumable" | "personal" | "currency";
    equipped: boolean;
    description: string;
  }>;

  currency: {
    cp: number; sp: number; ep: number; gp: number; pp: number;
  };

  notes: {
    world: NoteEntry[];
    npcs: NoteEntry[];
    quests: QuestEntry[];
    journal: JournalEntry[];
    quick: string[];
  };
}

interface NoteEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  fields?: Record<string, string>;
}

interface QuestEntry extends NoteEntry {
  status: "active" | "completed" | "failed";
  givenBy: string;
}

interface JournalEntry {
  id: string;
  session: number;
  date: string;
  title: string;
  content: string;
}
```

App settings stored separately under `mavok_settings`:

```typescript
interface AppSettings {
  theme: "dark-fantasy" | "dnd-classic";
  lastCharacterId: string;
}
```

## Tab Layout

Five tabs in a fixed bottom tab bar.

### Tab 1: Ficha (Shield icon)

The character identity and reference tab. Collapsible sections:

- **Información general**: Name, level, class, species, background, origin
- **Atributos**: 6 ability scores with modifiers
- **Tiradas de salvación**: All 6 saves with proficiency indicators
- **Habilidades**: All 18 skills with totals and proficiency indicators
- **Competencias**: Armor, weapons, tools, languages
- **Rasgos y características**: All features from class, species, background, feats
- **Apariencia**: Physical description
- **Personalidad**: Trait, ideal, bond, flaw
- **Historia**: Backstory summary
- **Objetivos**: Current character goals

### Tab 2: Combate (Sword icon)

Everything needed during a fight, nothing else.

**Top bar** (always visible):
- HP: `12/16` — tappable, opens +/- modal for damage/healing
- Temp HP: `+0` — tappable to set
- AC: `14`
- Init: `+2` — tappable to roll
- Inspiration: star icon toggle
- Rage: `2/2` — tappable to activate/deactivate

**Rage active indicator**: When rage is on, the Combat tab gets a subtle red glow/pulse on the top bar border. Damage values in attack rows auto-update to include rage bonus.

**Death saves**: Replace the top bar when HP reaches 0. Three success checkboxes, three failure checkboxes.

**Conditions strip**: Horizontal tag row. Tap "+" to add from predefined 5.5e list. Tap a tag to remove.

**Acciones** (collapsible, default open):

Each attack row shows:
- Name, to-hit bonus, damage dice + type
- Properties (Heavy, Light, Thrown, etc.)
- Weapon Mastery effect (expandable): describes the effect and shows save DC where applicable
- **Roll button**: Taps to roll d20 + attack bonus. Second tap rolls damage.
- When Rage is active, damage displays update automatically (+2 rage damage on STR-based melee)

Attacks at level 1:
| Attack | To-Hit | Damage | Mastery |
|--------|--------|--------|---------|
| Maul | +5 | 2d6+3 bludg. | Topple: DC 13 STR save or Prone |
| Handaxe (melee) | +5 | 1d6+3 slash. | Vex: next attack has advantage |
| Handaxe (thrown) | +5 | 1d6+3 slash. | Vex (20/60 ft) |
| Javelin | +5 | 1d6+3 pierc. | — |
| Sickle | +5 | 1d4+3 slash. | — |

**Acciones adicionales** (Bonus Actions):
- Rage: Activate (costs bonus action)
- Offhand Attack (Handaxe): 1d6 slashing (no STR mod)

**Reacciones**:
- Opportunity Attack: Same weapon options as Actions

**Dados** (Dice Roller, collapsible):
- Quick buttons: d4, d6, d8, d10, d12, d20
- Custom roll input: `2d6+5`, `1d20+5`, etc.
- Last 5 rolls shown for reference
- Brief roll animation (0.3s)

### Tab 3: Inventario (Backpack icon)

**Currency bar** (top): CP | SP | EP | GP | PP — each tappable to edit.

**Equipment list**: Scrollable list of items grouped by category. Each item shows name, quantity, equipped status (toggle), weight. Tap to expand for description. Swipe to delete.

**Add item**: Floating "+" button. Fields: name, quantity, weight, category, description.

**Encumbrance footer**: `Peso: 45 / 510 lbs` — Calculated from STR 17 × 15 × 2 (Powerful Build). Informational only, no penalties enforced.

**Export**: Button to export inventory as CSV.

### Tab 4: Notas (Book icon)

Sub-navigation at top: **Rápidas** | Mundo | NPCs | Misiones | Diario

**Rápidas** (default view): Simple text input + list. Type, tap add. Each note is a single line with a timestamp. Can be promoted to a structured entry (long-press → "Mover a Mundo/NPCs/Misiones").

**Mundo**: List of world notes (locations, lore, events). Tap to view/edit. Each has title, content, tags, optional structured fields.

**NPCs**: Same format. Optional fields: race, location, relationship, status.

**Misiones**: Quest entries with status (Activa/Completada/Fallida), given-by field. Filter by status.

**Diario**: Session journal. Entries have session number, date, title, freeform content. Chronological order.

**Add entry**: Each sub-section has its own "+" button with the appropriate form.

### Tab 5: Ajustes (Gear icon)

- **Tema**: Toggle Dark Fantasy / D&D Classic
- **Descanso corto**: Opens flow to spend hit dice. Rolls 1d12 + CON mod per die spent. Shows healing applied.
- **Descanso largo**: Confirmation modal showing what resets (HP to max, all rage uses, hit dice recovery, death saves cleared). Apply on confirm.
- **Subir de nivel**: Launches guided level-up flow.
- **Exportar datos**: Download full character JSON (`mavok-backup-YYYY-MM-DD.json`)
- **Importar datos**: Upload JSON, preview, confirm to overwrite
- **Exportar inventario**: Download inventory CSV
- **Exportar notas rápidas**: Download as plain text
- **Acerca de**: App version, character name

## Level-Up System

Guided flow triggered from Ajustes. Hardcoded progression data for Barbarian + Path of the Berserker + Goliath + Tough feat.

**Flow**:
1. Confirm level ("Mavok sube a nivel X. ¿Continuar?")
2. HP: Roll 1d12 (inline dice roller) or take average (7). Add CON mod (+2) and Tough (+2). Confirm result.
3. New features: Present each new feature with description. Review and confirm.
4. Other changes: Proficiency bonus increases, new rage uses, rage damage increases, weapon mastery slots, ASI/feat choices. Only shows what's relevant for that level.
5. Summary: Shows all changes. Confirm to apply.

**ASI/Feat at level 4, 8, 12, 16, 19**:
- Presents choice: increase ability scores (+2 to one / +1 to two) or pick a feat
- Includes all 77 XPHB feats (Origin, General, Fighting Style, Epic Boon) imported from 5etools data
- Auto-filters by prerequisites: only shows feats the character qualifies for (ability scores, level, proficiencies, spellcasting)
- Categories: Origin (level 1), General (level 4+), Fighting Style (class-dependent), Epic Boon (level 19)
- Also allows manual entry for homebrew or non-XPHB feats
- When ability scores change, all derived values recalculate automatically (attack bonuses, saves, skills, AC, HP if CON, mastery DCs)

**Derived value recalculation**: When attributes or proficiency bonus change (via ASI, feat, or level-up), the app recalculates: attack bonuses, save totals, skill totals, AC (Unarmored Defense), passive perception, weapon mastery save DCs, and carrying capacity.

**Progression data scope**:
- Barbarian base class (levels 1-20)
- All 4 XPHB subclasses (features at levels 3, 6, 10, 14):
  - Path of the Berserker: Frenzy → Mindless Rage → Retaliation → Intimidating Presence
  - Path of the Wild Heart: Animal totems → Aspect of the Wilds → Nature Speaker → Power of the Wilds
  - Path of the World Tree: Vitality → Branches of the Tree → Battering Roots → Travel Along the Tree
  - Path of the Zealot: Divine Fury → Fanatical Focus → Zealous Presence → Rage of the Gods
- Goliath species (Large Form, etc.)
- Tough feat (+2 HP per level)
- Subclass selection presented at level 3 (defaults to Berserker for Mavok, but user can pick any)

**Reference data sourced from 5etools** (`../dnd/5etools-src/data/`):
- **Feats**: All 77 XPHB feats with prerequisites, descriptions, and categories (feats.json)
- **Barbarian progression**: Class features per level, subclass features (class/class-barbarian.json)
- **Conditions**: All 15 XPHB conditions with mechanical effects — powers the combat conditions strip (conditionsdiseases.json)
- **Weapons**: 38 weapons (28 melee + 10 ranged) with damage, properties, weight, and weapon mastery — powers "add weapon" in combat/inventory with auto-filled stats (items-base.json)
- **Armor**: 13 entries (light/medium/heavy/shield) with AC and weight — auto-calculates AC when equipped (items-base.json)
- **Weapon Mastery properties**: Full descriptions of all mastery effects (Topple, Vex, Nick, Graze, etc.) — shown in combat attack rows (items-base.json)
- **Goliath species**: Trait verification (races.json)

## Themes

### Dark Fantasy (default)
- Background: `#1a1a2e` (deep charcoal)
- Card background: `#16213e`
- Accent: `#8b2d2d` (muted red — Toduk-Rojum cord)
- Text: `#e8e0d4` (warm off-white)
- Headers font: Cinzel
- Body font: Inter

### D&D Classic
- Background: `#0d1117` (dark navy)
- Card background: `#161b22`
- Accent: `#c0392b` (classic red)
- Text: `#ffffff`
- Same fonts, adjusted weights

Themes implemented via CSS custom properties. Toggle in Ajustes, stored in LocalStorage.

## PWA Configuration

- `manifest.json`: App name "Mavok", short name "Mavok", `display: standalone`, `theme_color` matches Dark Fantasy, icons at 192px and 512px
- Service worker caches all static assets on install
- Full offline support after first load
- Installable on iOS and Android home screens

## Import/Export

- **JSON export**: Full character data. Filename: `mavok-backup-YYYY-MM-DD.json`
- **JSON import**: Upload file, preview character name and level, confirm to overwrite current data
- **CSV inventory export**: Columns: Name, Quantity, Weight, Category, Equipped, Description
- **Quick notes text export**: Plain text, one note per line with timestamp

## Initial Data

The app ships pre-loaded with Mavok's level 1 data from `ficha.md`:
- All attributes, skills, saves, proficiencies
- Combat stats (HP 16, AC 14, etc.)
- All attacks with mastery effects
- Full inventory and equipment
- Currency: 30 GP
- Features: Rage, Unarmored Defense, Weapon Mastery, Giant Ancestry, Powerful Build, Tough
- Personality, appearance, backstory, goals

## Out of Scope (for now)

- Multiple character support (data model supports it, UI doesn't)
- Multiclassing
- Spell tracking
- Note search/filter
- Note cross-linking
- XP tracking (milestone leveling)
- Encumbrance penalties
- Party/shared features
