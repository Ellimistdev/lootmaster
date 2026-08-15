import { afterEach, describe, expect, it } from "vitest";
import {
  decodeRoster,
  encodeRoster,
  memberKey,
  normalizeRoster,
  roleForMember,
  titleCaseName,
} from "./roster";

afterEach(() => {
  delete window.LZString;
});

describe("roster helpers", () => {
  it("normalizes player names to title case", () => {
    expect(titleCaseName("eLLIMIST")).toBe("Ellimist");
    expect(titleCaseName("foo-bar")).toBe("Foo-Bar");
    expect(titleCaseName("o'BRIEN")).toBe("O'Brien");
  });

  it("uses case-insensitive class and player identity", () => {
    expect(memberKey({ className: "Mage", name: "Chocolate" })).toBe("Mage::chocolate");
    expect(memberKey({ className: "Mage", name: "CHOCOLATE" })).toBe("Mage::chocolate");
  });

  it("rejects duplicate imported members", () => {
    expect(() =>
      normalizeRoster([
        { name: "Elli", className: "Shaman", mainSpec: "Restoration", offSpecs: [] },
        { name: "ELLI", className: "Shaman", mainSpec: "Elemental", offSpecs: [] },
      ]),
    ).toThrow(/Duplicate roster member/i);
  });

  it("normalizes imported names and removes invalid offspecs", () => {
    expect(
      normalizeRoster([
        {
          name: "cHOCOLATE",
          className: "Mage",
          mainSpec: "Arcane",
          offSpecs: ["Frost", "Arcane", "Not A Spec", "Frost"],
        },
      ]),
    ).toEqual([
      {
        name: "Chocolate",
        className: "Mage",
        mainSpec: "Arcane",
        offSpecs: ["Frost"],
      },
    ]);
  });

  it("derives member roles from centralized spec metadata", () => {
    expect(roleForMember({ className: "Monk", mainSpec: "Brewmaster" })).toBe("tank");
    expect(roleForMember({ className: "Shaman", mainSpec: "Restoration" })).toBe("healer");
    expect(roleForMember({ className: "Mage", mainSpec: "Arcane" })).toBe("dps");
  });

  it("round-trips encoded roster strings through the configured codec", () => {
    window.LZString = {
      compressToEncodedURIComponent: (value) => encodeURIComponent(value),
      decompressFromEncodedURIComponent: (value) => decodeURIComponent(value),
    };

    const roster = [
      { name: "Chocolate", className: "Mage", mainSpec: "Arcane", offSpecs: ["Frost"] },
    ];
    const encoded = encodeRoster(roster);

    expect(encoded.startsWith("LM1:")).toBe(true);
    expect(decodeRoster(encoded)).toEqual(roster);
  });

  it("rejects unencoded roster input", () => {
    expect(() => decodeRoster('[{"name":"Chocolate"}]')).toThrow(/Invalid roster string/i);
  });
});
