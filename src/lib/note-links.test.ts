import { describe, it, expect } from "vitest";
import {
  buildLinkableNotes,
  linkifyMentions,
  parseNoteLink,
  type LinkableNote,
} from "./note-links";
import type { Notes } from "./types";

const EMPTY_NOTES: Notes = {
  world: [],
  npcs: [],
  quests: [],
  journal: [],
  quick: [],
};

describe("linkifyMentions", () => {
  it("links a single-word mention to a matching note", () => {
    const linkables: LinkableNote[] = [
      { id: "npc-1", section: "npcs", title: "Riti" },
    ];
    expect(linkifyMentions("Hogar de @Riti", linkables)).toBe(
      "Hogar de [Riti](mavok-note://npcs/npc-1)"
    );
  });

  it("prefers the longest matching title over a shorter prefix", () => {
    const linkables: LinkableNote[] = [
      { id: "world-1", section: "world", title: "Casona" },
      { id: "world-2", section: "world", title: "Casona Vaelcrest" },
    ];
    expect(linkifyMentions("Vive en @Casona Vaelcrest ahora", linkables)).toBe(
      "Vive en [Casona Vaelcrest](mavok-note://world/world-2) ahora"
    );
  });

  it("leaves an unmatched mention as plain text", () => {
    const linkables: LinkableNote[] = [
      { id: "npc-1", section: "npcs", title: "Riti" },
    ];
    expect(linkifyMentions("Hogar de @Nadie", linkables)).toBe(
      "Hogar de @Nadie"
    );
  });

  it("doesn't match a title as a prefix of a longer word", () => {
    const linkables: LinkableNote[] = [
      { id: "npc-1", section: "npcs", title: "Riti" },
    ];
    expect(linkifyMentions("@Ritila no es Riti", linkables)).toBe(
      "@Ritila no es Riti"
    );
  });

  it("resolves same-length title collisions using the linkables array order", () => {
    const linkables: LinkableNote[] = [
      { id: "npc-1", section: "npcs", title: "Sol" },
      { id: "world-1", section: "world", title: "Sol" },
    ];
    expect(linkifyMentions("@Sol brilla", linkables)).toBe(
      "[Sol](mavok-note://npcs/npc-1) brilla"
    );
  });
});

describe("buildLinkableNotes", () => {
  it("orders NPCs before Mundo, Misiones, and Diario", () => {
    const notes: Notes = {
      ...EMPTY_NOTES,
      world: [
        { id: "w1", title: "Mundo Uno", content: "", tags: [], createdAt: "", updatedAt: "" },
      ],
      npcs: [
        { id: "n1", title: "NPC Uno", content: "", tags: [], createdAt: "", updatedAt: "" },
      ],
      quests: [
        {
          id: "q1",
          title: "Quest Uno",
          content: "",
          tags: [],
          givenBy: "",
          status: "active",
          createdAt: "",
          updatedAt: "",
        },
      ],
      journal: [{ id: "j1", title: "Diario Uno", session: 1, date: "", content: "" }],
    };
    const result = buildLinkableNotes(notes);
    expect(result.map((l) => l.section)).toEqual([
      "npcs",
      "world",
      "quests",
      "journal",
    ]);
  });
});

describe("parseNoteLink", () => {
  it("parses a valid mavok-note:// href", () => {
    expect(parseNoteLink("mavok-note://npcs/npc-1")).toEqual({
      section: "npcs",
      id: "npc-1",
    });
  });

  it("returns null for a non-matching href", () => {
    expect(parseNoteLink("https://example.com")).toBeNull();
  });
});
