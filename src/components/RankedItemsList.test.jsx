import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import RankedItemsList from "./RankedItemsList";

function makeRankedRows() {
  const baseSpec = {
    short: "ZZSpec",
    full: "Shaman - Restoration",
    color: "#0070DE",
  };

  return [
    {
      item: {
        id: 1,
        name: "Test Item One",
        slot: "Ring",
        type: "Ring",
        primary: null,
        stats: ["crit", "haste"],
        error: null,
      },
      s: [{ rank: 1, specs: [{ spec: baseSpec, result: { tier: "S", rank: 1, reason: "Best fit" } }] }],
      a: [],
      trash: [],
      detail: [{ spec: baseSpec, result: { tier: "S", rank: 1, reason: "Best fit" } }],
    },
    {
      item: {
        id: 2,
        name: "Test Item Two",
        slot: "Neck",
        type: "Neck",
        primary: null,
        stats: ["vers", "mastery"],
        error: null,
      },
      s: [],
      a: [],
      trash: [{ rank: 999, specs: [{ spec: baseSpec, result: { tier: "Trash", rank: 999, reason: "No match" } }] }],
      detail: [{ spec: baseSpec, result: { tier: "Trash", rank: 999, reason: "No match" } }],
    },
  ];
}

function RankedItemsListHarness({ ranked, onSpecPress = vi.fn() }) {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSelectItem = (row) => {
    setSelectedItem((current) => (current?.item.id === row.item.id ? null : row));
  };

  return (
    <RankedItemsList
      ranked={ranked}
      selectedItem={selectedItem}
      onSelectItem={handleSelectItem}
      onSpecPress={onSpecPress}
    />
  );
}

describe("RankedItemsList", () => {
  it("inserts and removes inline details when selecting the same mobile card", () => {
    const ranked = makeRankedRows();
    render(<RankedItemsListHarness ranked={ranked} />);

    expect(screen.queryByText("Rank 1 • Best fit")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /test item one/i }));
    expect(screen.getAllByText("Rank 1 • Best fit").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /test item one/i }));
    expect(screen.queryByText("Rank 1 • Best fit")).toBeNull();
  });

  it("adds and removes inline table detail rows on desktop table row click", () => {
    const ranked = makeRankedRows();
    const { container } = render(<RankedItemsListHarness ranked={ranked} />);

    const tableBody = container.querySelector("table tbody");
    expect(tableBody).not.toBeNull();
    const initialRowCount = within(tableBody).getAllByRole("row").length;

    const [firstTableRow] = within(tableBody).getAllByRole("row");
    fireEvent.click(firstTableRow);
    const expandedRowCount = within(tableBody).getAllByRole("row").length;
    expect(expandedRowCount).toBe(initialRowCount + 1);

    fireEvent.click(firstTableRow);
    const collapsedRowCount = within(tableBody).getAllByRole("row").length;
    expect(collapsedRowCount).toBe(initialRowCount);
  });

  it("calls onSpecPress when a mobile spec token is tapped", () => {
    const ranked = makeRankedRows();
    const onSpecPress = vi.fn();
    const { container } = render(<RankedItemsListHarness ranked={ranked} onSpecPress={onSpecPress} />);

    const mobileList = container.querySelector(".md\\:hidden");
    expect(mobileList).not.toBeNull();

    fireEvent.click(within(mobileList).getAllByRole("button", { name: "ZZSpec" })[0]);

    expect(onSpecPress).toHaveBeenCalledTimes(1);
    const [rowArg, itemArg] = onSpecPress.mock.calls[0];
    expect(rowArg.spec.full).toBe("Shaman - Restoration");
    expect(itemArg.name).toBe("Test Item One");
  });
});
