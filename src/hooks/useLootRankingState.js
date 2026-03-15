import { useState } from "react";
import { useComputed } from "./useComputed";
import { useSpecOverrides } from "./useSpecOverrides";
import { useItemSelection } from "./useItemSelection";

export function useLootRankingState() {
  const [manualItemsText, setManualItemsText] = useState("");
  const [showManualItems, setShowManualItems] = useState(false);
  const [bossFilter, setBossFilter] = useState("All bosses");
  const [query, setQuery] = useState("");

  const specOverridesState = useSpecOverrides();
  const itemSelectionState = useItemSelection();

  const computed = useComputed(manualItemsText, specOverridesState.specOverrides, query, bossFilter);

  return {
    manualItemsText,
    setManualItemsText,
    showManualItems,
    setShowManualItems,
    bossFilter,
    setBossFilter,
    query,
    setQuery,
    ...specOverridesState,
    ...itemSelectionState,
    ...computed,
  };
}
