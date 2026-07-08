import { describe, it, expect } from "vitest";
import { parseCharacterJSON } from "./export";

describe("parseCharacterJSON", () => {
  it("parses valid JSON into an object", () => {
    const result = parseCharacterJSON('{"meta":{"name":"Mavok"}}');
    expect(result).toEqual({ meta: { name: "Mavok" } });
  });

  it("throws a Spanish error message for invalid JSON", () => {
    expect(() => parseCharacterJSON("not json")).toThrow("Archivo JSON inválido");
  });
});
