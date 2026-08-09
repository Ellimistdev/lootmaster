<img width="1873" height="977" alt="image" src="https://github.com/user-attachments/assets/71e4e10c-6d12-402b-a8e2-cbabe3d3a547" />

Midnight Loot Master is a World of Warcraft raid-loot planning tool for comparing boss drops against spec secondary-stat priorities. It is designed to help raid teams quickly see which specs value an item most, while providing a consistent starting point for loot discussions.

The application is currently loaded with the **Midnight Season 2** raid loot table and a built-in library of class/spec stat priorities.

## Features

- **Boss-by-boss loot rankings** - browse the built-in Season 2 raid loot table and filter results by encounter.
- **S / A / Trash rankings** - items are classified for each compatible spec based on the ordering of their secondary stats.
- **Weapon compatibility** - weapon results account for primary stat, weapon type, and spec-specific weapon restrictions.
- **Spec priority library** - includes default secondary-stat priorities for every spec, along with the date each priority was last updated.
- **Custom spec overrides** - temporarily replace the built-in priority for any spec and import/export overrides as JSON.
- **Manual item input** - add one-off items without modifying the built-in loot table.
- **Search and filtering** - search across item names, slots, types, stats, and bosses.
- **Sortable Effective Spec Library** - inspect the priorities currently being used, including active overrides and last-updated dates.

## How Rankings Work

Loot Master ranks items using **secondary stats only**. Primary stats are used for item/spec compatibility but are not part of the S/A/Trash ranking itself.

Item secondary stats are ordered as `Stat 1 > Stat 2`; Stat 1 represents the larger amount on the item.

### S Tier

An item is **S Tier** when its highest secondary stat matches the spec's most-preferred secondary stat.

Within S Tier, stronger matches are ranked ahead of weaker matches, including items where both secondaries match highly preferred stats.

### A Tier

An item is **A Tier** when its highest secondary stat matches the spec's second-highest priority but does not qualify for S Tier.

### Trash

Items that do not meet the S or A criteria are placed in **Trash** for that spec.

Equal priorities such as `Crit = Mastery` are supported. The application currently models priority relationships using `>` and `=`.

## Weapon Compatibility

Weapon rankings are filtered so that only specs capable of using a weapon are included. The compatibility rules account for distinctions such as:

- Strength vs. Agility vs. Intellect weapons
- One-handed and two-handed weapons
- Daggers, fist weapons, polearms, staves, shields, off-hands, bows, guns, and warglaives
- Dual-primary Agility/Strength weapons
- Spec-specific restrictions such as ranged Hunter weapons and Demon Hunter warglaives

## Trinkets

Trinkets are intentionally excluded from the ranking table because secondary-stat priority alone is not sufficient to evaluate them.

For trinket comparisons, use simulation or role-specific resources such as Bloodmallet or Questionably Epic.

## Spec Data

The built-in class library stores, for each spec:

- primary stat
- ordered secondary-stat priority
- last-updated date

The application also exposes the overall spec-data season/version and update date in the interface.

Custom overrides are stored locally in the browser and take precedence over the built-in priority until reset.

## Manual Items

The built-in raid table can be supplemented with manual entries for testing or evaluating items that are not part of the current raid dataset. Manual items are combined with the default loot table for ranking without changing the source data.

## Development

This project is a React application built with Vite.

### Requirements

- Node.js
- npm

### Run locally

```bash
npm install
npm run dev
```

Vite will print the local development URL after startup.

### Production build

```bash
npm run build
```

## Data Maintenance

Season loot data is stored separately from the class/spec priority library so raid drops can be updated independently from spec tuning.

When updating spec priorities, update both the priority and that spec's `updatedAt` metadata. When beginning a new season, also update the global spec-data version and update date.
