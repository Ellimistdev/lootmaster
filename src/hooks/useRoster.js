import { useMemo, useState } from "react";
import { CLASS_LIBRARY } from "../data/constants";

const STORAGE_KEY = "lootmaster_roster";
const TANKS = new Set(["Death Knight - Blood", "Demon Hunter - Vengeance", "Druid - Guardian", "Monk - Brewmaster", "Paladin - Protection", "Warrior - Protection"]);
const HEALERS = new Set(["Druid - Restoration", "Evoker - Preservation", "Monk - Mistweaver", "Paladin - Holy", "Priest - Discipline", "Priest - Holy", "Shaman - Restoration"]);

const loadRoster = () => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};

export function roleForMember(member) {
  const full = `${member.className} - ${member.mainSpec}`;
  return TANKS.has(full) ? "Tanks" : HEALERS.has(full) ? "Healers" : "DPS";
}

export function useRoster() {
  const [roster, setRosterState] = useState(loadRoster);
  const [showRoster, setShowRoster] = useState(false);

  const setRoster = (next) => {
    const value = typeof next === "function" ? next(roster) : next;
    setRosterState(value);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  };

  const playerNamesBySpec = useMemo(() => {
    const map = {};
    roster.forEach((member) => {
      [member.mainSpec, ...(member.offSpecs || [])].forEach((spec) => {
        const full = `${member.className} - ${spec}`;
        (map[full] ||= []).push(member.name);
      });
    });
    Object.values(map).forEach((names) => names.sort((a, b) => a.localeCompare(b)));
    return map;
  }, [roster]);

  const classOptions = Object.keys(CLASS_LIBRARY);
  return { roster, setRoster, showRoster, setShowRoster, playerNamesBySpec, rosterClassOptions: classOptions };
}
