import { useMemo, useState } from "react";
import { CLASS_LIBRARY } from "../data/constants";

const STORAGE_KEY = "lootmaster_roster";
const TANKS = new Set(["Death Knight - Blood", "Demon Hunter - Vengeance", "Druid - Guardian", "Monk - Brewmaster", "Paladin - Protection", "Warrior - Protection"]);
const HEALERS = new Set(["Druid - Restoration", "Evoker - Preservation", "Monk - Mistweaver", "Paladin - Holy