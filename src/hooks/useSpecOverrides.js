import { useEffect, useRef, useState } from "react";
import { DEFAULT_SPEC_ROWS } from "../data/constants";
import { defaultSpecMap, parseSpecOverridesJson, serializeSpecOverrides } from "../utils/lootLogic";

const INITIAL_SELECTED_SPEC_FULL = DEFAULT_SPEC_ROWS[0][0];
const [INITIAL_SELECTED_CLASS, INITIAL_SELECTED_SPEC_NAME] = INITIAL_SELECTED_SPEC_FULL.split(" - ").map((x) => x.trim());
const SPEC_OVERRIDES_STORAGE_KEY = "midnight-lootmaster-spec-overrides-v1";

function loadStoredSpecOverrides() {
  try {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage.getItem(SPEC_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    return parseSpecOverridesJson(raw);
  } catch {
    return {};
  }
}

export function useSpecOverrides() {
  const [showSpecOverrides, setShowSpecOverrides] = useState(false);
  const [specOverrides, setSpecOverrides] = useState(() => loadStoredSpecOverrides());
  const [selectedClass, setSelectedClass] = useState(INITIAL_SELECTED_CLASS);
  const [selectedSpecName, setSelectedSpecName] = useState(INITIAL_SELECTED_SPEC_NAME);
  const [draftOverride, setDraftOverride] = useState(defaultSpecMap()[INITIAL_SELECTED_SPEC_FULL]);
  const importOverridesInputRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SPEC_OVERRIDES_STORAGE_KEY, serializeSpecOverrides(specOverrides));
  }, [specOverrides]);

  const classToSpecs = DEFAULT_SPEC_ROWS.reduce((acc, [full]) => {
    const [className, specName] = full.split(" - ").map((x) => x.trim());
    if (!acc[className]) acc[className] = [];
    acc[className].push(specName);
    return acc;
  }, {});

  const classOptions = Object.keys(classToSpecs).sort((a, b) => a.localeCompare(b));
  const specOptionsForClass = [...(classToSpecs[selectedClass] || [])].sort((a, b) => a.localeCompare(b));
  const selectedSpec = `${selectedClass} - ${selectedSpecName}`;

  const handleSelectedClassChange = (nextClass) => {
    const nextSpecName = ([...(classToSpecs[nextClass] || [])].sort((a, b) => a.localeCompare(b))[0]) || "";
    const nextSpec = `${nextClass} - ${nextSpecName}`;
    setSelectedClass(nextClass);
    setSelectedSpecName(nextSpecName);
    setDraftOverride(specOverrides[nextSpec] || defaultSpecMap()[nextSpec]);
  };

  const handleSelectedSpecChange = (nextSpecName) => {
    const nextSpec = `${selectedClass} - ${nextSpecName}`;
    setSelectedSpecName(nextSpecName);
    setDraftOverride(specOverrides[nextSpec] || defaultSpecMap()[nextSpec]);
  };

  const updateSelectedSpec = (field, index, value) => {
    setDraftOverride((prev) => {
      const next = { stats: [...prev.stats], comps: [...prev.comps] };
      next[field][index] = value;
      return next;
    });
  };

  const applySelectedSpecOverride = () => {
    const uniqueStats = new Set(draftOverride.stats);
    if (uniqueStats.size !== draftOverride.stats.length) {
      window.alert("Duplicate stats are not allowed in priority order. Please choose 4 unique stats.");
      return;
    }

    setSpecOverrides((prev) => ({ ...prev, [selectedSpec]: draftOverride }));
  };

  const resetSelectedSpec = () => {
    setSpecOverrides((prev) => {
      const next = { ...prev };
      delete next[selectedSpec];
      return next;
    });
    setDraftOverride(defaultSpecMap()[selectedSpec]);
  };

  const resetAllSpecs = () => {
    setSpecOverrides({});
    setDraftOverride(defaultSpecMap()[selectedSpec]);
  };

  const exportSpecOverrides = () => {
    const json = serializeSpecOverrides(specOverrides);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spec_overrides.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSpecOverridesFromFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = parseSpecOverridesJson(text);
      setSpecOverrides(imported);
      setDraftOverride(imported[selectedSpec] || defaultSpecMap()[selectedSpec]);
    } catch {
      window.alert("Could not import overrides. Please select a valid JSON file.");
    } finally {
      event.target.value = "";
    }
  };

  return {
    showSpecOverrides,
    setShowSpecOverrides,
    specOverrides,
    selectedClass,
    selectedSpecName,
    draftOverride,
    importOverridesInputRef,
    classOptions,
    specOptionsForClass,
    selectedSpec,
    handleSelectedClassChange,
    handleSelectedSpecChange,
    updateSelectedSpec,
    applySelectedSpecOverride,
    resetSelectedSpec,
    resetAllSpecs,
    exportSpecOverrides,
    importSpecOverridesFromFile,
  };
}
