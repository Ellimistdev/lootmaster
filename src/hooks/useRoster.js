import { useMemo, useState } from "react";
import { CLASS_OPTIONS, specKey } from "../data/constants";

const STORAGE_KEY = "lootmaster_roster";

const loadRoster = () => {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

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

      const fullSpec = specKey(member.className, member.mainSpec);
      (map[fullSpec] ||= []).push(member.name);
    });

    Object.values(map).forEach((names) => {
      names.sort((a, b) => a.localeCompare(b));
    });

    return map;
  }, [roster]);

  return {
    roster,
    setRoster,
    showRoster,
    setShowRoster,
    playerNamesBySpec,
    rosterClassOptions: CLASS_OPTIONS,
  };
}
