import { describe, expect, it, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSpecOverrides } from "./useSpecOverrides";

describe("useSpecOverrides", () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  const originalCreateElement = document.createElement.bind(document);

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    document.createElement = originalCreateElement;
  });

  it("does not apply override when stats contain duplicates", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const { result } = renderHook(() => useSpecOverrides());

    act(() => {
      result.current.updateSelectedSpec("stats", 1, result.current.draftOverride.stats[0]);
    });

    act(() => {
      result.current.applySelectedSpecOverride();
    });

    expect(alertSpy).toHaveBeenCalled();
    expect(result.current.specOverrides[result.current.selectedSpec]).toBeUndefined();
  });

  it("applies and resets selected override", () => {
    const { result } = renderHook(() => useSpecOverrides());

    act(() => {
      result.current.applySelectedSpecOverride();
    });

    expect(result.current.specOverrides[result.current.selectedSpec]).toBeDefined();

    act(() => {
      result.current.resetSelectedSpec();
    });

    expect(result.current.specOverrides[result.current.selectedSpec]).toBeUndefined();
  });

  it("resets all overrides", () => {
    const { result } = renderHook(() => useSpecOverrides());

    act(() => {
      result.current.applySelectedSpecOverride();
    });
    expect(Object.keys(result.current.specOverrides).length).toBe(1);

    act(() => {
      result.current.resetAllSpecs();
    });

    expect(result.current.specOverrides).toEqual({});
  });

  it("exports overrides as a downloadable file", () => {
    const { result } = renderHook(() => useSpecOverrides());

    act(() => {
      result.current.applySelectedSpecOverride();
    });

    const clickSpy = vi.fn();
    const fakeAnchor = { href: "", download: "", click: clickSpy };

    URL.createObjectURL = vi.fn(() => "blob:mock-url");
    URL.revokeObjectURL = vi.fn();
    document.createElement = vi.fn((tagName) => {
      if (tagName === "a") return fakeAnchor;
      return originalCreateElement(tagName);
    });

    act(() => {
      result.current.exportSpecOverrides();
    });

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(fakeAnchor.download).toBe("spec_overrides.json");
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("imports valid override JSON from file", async () => {
    const { result } = renderHook(() => useSpecOverrides());
    const selectedSpec = result.current.selectedSpec;

    const payload = JSON.stringify({
      overrides: {
        [selectedSpec]: {
          stats: ["Crit", "Haste", "Mast", "Vers"],
          comps: [">", ">", ">"],
        },
      },
    });

    const mockEvent = {
      target: {
        files: [{ text: vi.fn().mockResolvedValue(payload) }],
        value: "initial",
      },
    };

    await act(async () => {
      await result.current.importSpecOverridesFromFile(mockEvent);
    });

    expect(result.current.specOverrides[selectedSpec]).toEqual({
      stats: ["Crit", "Haste", "Mast", "Vers"],
      comps: [">", ">", ">"],
    });
    expect(mockEvent.target.value).toBe("");
  });
});
