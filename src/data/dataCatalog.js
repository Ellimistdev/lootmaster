// Register public datasets here as they become available.
// Only published entries expose a downloadable URL.
export const dataCatalog = [
  {
    id: "encounter-loot",
    title: "Encounter Journal Loot Eligibility",
    description: "Boss loot pools by raid, encounter, difficulty, and specialization, collected from the in-game Encounter Journal.",
    category: "Loot eligibility",
    status: "published",
    format: "JSON",
    url: "/data/encounter-loot.json",
    source: "Lootmaster Journal Harvester",
    sourceUrl: "https://github.com/Ellimistdev/lootmaster/tree/master/data/harvests",
  },
  {
    id: "bonus-ids",
    title: "Item Bonus IDs",
    description: "Reference data for item bonus IDs and their effects, such as item levels, upgrade tracks, and item variants.",
    category: "Item metadata",
    status: "planned",
    format: "JSON",
  },
  {
    id: "item-modifiers",
    title: "Item Contexts & Modifiers",
    description: "Item context and modifier mappings for interpreting item links and SimulationCraft bonus-roll records.",
    category: "Item metadata",
    status: "planned",
    format: "JSON",
  },
]
