import React, { createContext, useContext, useEffect, useState } from "react";

type StudioContextValue = {
  previewColor: string;
  setPreviewColor: (color: string) => void;
  colorPickerHint: string | null;
  setColorPickerHint: (hint: string | null) => void;
  colorVariableValues: Record<string, string>;
  setColorVariableValue: (variable: string, color: string) => void;
};

const StudioContext = createContext<StudioContextValue | undefined>(undefined);

export const StudioProvider = ({ children }: { children: React.ReactNode }) => {
  const savedColor =
    typeof window !== "undefined"
      ? localStorage.getItem("iconoma-studio-preview-color")
      : "#e5e5e5";
  const [previewColor, setPreviewColor] = useState<string>(
    savedColor || "#e5e5e5"
  );
  const [colorPickerHint, setColorPickerHint] = useState<string | null>(null);

  const loadColorVariableValues = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("iconoma-studio-color-variables");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {};
  };

  const [colorVariableValues, setColorVariableValuesState] = useState<
    Record<string, string>
  >(loadColorVariableValues);

  const setColorVariableValue = (variable: string, color: string) => {
    setColorVariableValuesState((prev) => {
      const updated = { ...prev, [variable]: color };
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "iconoma-studio-color-variables",
          JSON.stringify(updated)
        );
      }
      return updated;
    });
  };

  useEffect(() => {
    localStorage.setItem("iconoma-studio-preview-color", previewColor);
  }, [previewColor]);

  return (
    <StudioContext.Provider
      value={{
        previewColor,
        setPreviewColor,
        colorPickerHint,
        setColorPickerHint,
        colorVariableValues,
        setColorVariableValue,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export function useStudio() {
  const ctx = useContext(StudioContext);

  if (!ctx) {
    throw new Error("useStudio must be used within a StudioProvider");
  }

  return ctx;
}
