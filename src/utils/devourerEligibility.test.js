import { describe, expect, it } from "vitest";
import { CLASS_LIBRARY } from "../data/constants";
import { parseSpecs, specCanUseItem, specCanUseWeapon } from "./lootLogic";

describe("Devourer Demon Hunter data and weapon eligibility", () => {
  it("uses Intellect with Haste > Crit > Mastery > Vers", () => {
    const devourer = CLASS_LIBRARY["Demon Hunter"].specs.Devourer;

    expect(devourer.primaryStat).toBe("Int");
    expect(devourer.secondaryPriority).toEqual(["Haste", ">", "Crit", ">", "Mast", ">", "Vers"]);
  });

  it("adds Devourer to Int dagger users without removing existing caster eligibility", () => {
    const devourer = { full: "Demon Hunter - Devourer", className: "Demon Hunter" };
    const havoc = { full: "Demon Hunter - Havoc", className: "Demon Hunter" };
    const vengeance = { full: "Demon Hunter - Vengeance", className: "Demon Hunter" };
    const fireMage = { full: "Mage - Fire", className: "Mage" };

    expect(specCanUseWeapon(devourer, "int-dagger")).toBe(true);
    expect(specCanUseWeapon(fireMage, "int-dagger")).toBe(true);
    expect(specCanUseWeapon(havoc, "int-dagger")).toBe(false);
    expect(specCanUseWeapon(vengeance, "int-dagger")).toBe(false);
  });

  it("does not grant Devourer other generic Int weapon categories", () => {
    const devourer = { full: "Demon Hunter - Devourer", className: "Demon Hunter" };

    expect(specCanUseWeapon(devourer, "int-mace")).toBe(false);
    expect(specCanUseWeapon(devourer, "int-sword")).toBe(false);
    expect(specCanUseWeapon(devourer, "int-staff")).toBe(false);
    expect(specCanUseWeapon(devourer, "int-offhand")).toBe(false);
  });

  it("allows an Int dagger item for parsed Devourer while rejecting it for Havoc and Vengeance", () => {
    const [devourer, havoc, vengeance] = parseSpecs([
      "Demon Hunter - Devourer\tInt > Haste > Crit > Mast > Vers",
      "Demon Hunter - Havoc\tAgi > Crit > Mast > Haste > Vers",
      "Demon Hunter - Vengeance\tAgi > Haste > Vers = Crit > Mast",
    ].join("\n"));

    const intDagger = {
      slot: "Weapon",
      type: "Dagger",
      primary: "Int",
      stats: ["haste", "crit"],
      error: null,
    };

    expect(specCanUseItem(devourer, intDagger)).toBe(true);
    expect(specCanUseItem(havoc, intDagger)).toBe(false);
    expect(specCanUseItem(vengeance, intDagger)).toBe(false);
  });
});
