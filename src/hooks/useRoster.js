import { useMemo, useState } from "react";
import { CLASS_LIBRARY } from "../data/constants";

const STORAGE_KEY = "lootmaster_roster";

const TANKS = new Set([
  "Death Knight - Blood",
  "Demon Hunter - Vengeance",
  "Druid - Guardian",
  "Monk - Brewmaster",
  "Paladin - Protection",
  "Warrior - Protection",
]);

const HEALERS = new Set([
  "Druid - Restoration",
  "Evoker - Preservation",
  "Monk - Mistweaver",
  "Paladin - Holy",
  "Priest - Discipline",
  "Priest - Holy",
  "Shaman - Restoration",
]);

const loadRoster = () => {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function roleForMember(member) {
  const fullSpec = `${member.className} - ${member.mainSpec}`;

  if (TANKS.has(fullSpec)) return "Tanks";
  if (HEALERS.has(fullSpec)) return "Healers";
  return "DPS";
}

export function useRoster() {
  const [roster, setRosterState] = useState(loadRoster);
  const [showRoster, setShowRoster] = useState(false);

  const setRoster = (next) => {
    setRosterState((current) => {
      const value = typeof next === "function" ? next(current) : next;

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      }

      return value;
    });
  };

  // Player names replace only the player's main spec in loot output.
  // Off-specs remain roster metadata and do not participate in substitution.
  const playerNamesBySpec = useMemo(() => {
    const map = {};

    roster.forEach((member) => {
      if (!member?.name || !member?.className || !member?.mainSpec) return;

      const fullSpec = `${member.className} - ${member.mainSpec}`;
      (map[fullSpec] ||= []).push(member.name);
    });

    Object.values(map).forEach((names) => {
      names.sort((a, b) => a.localeCompare(b));
    });

    return map;
  }, [roster]);

  const rosterClassOptions = Object.keys(CLASS_LIBRARY);

  return {
    roster,
    setRoster,
    showRoster,
    setShowRoster,
    playerNamesBySpec,
    rosterClassOptions,
  };
}
