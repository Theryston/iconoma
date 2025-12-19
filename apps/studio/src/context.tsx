import React, { createContext, useContext, useEffect, useState } from "react";

type StudioContextValue = {
  previewColor: string;
  setPreviewColor: (color: string) => void;
  colorPickerHint: string | null;
  setColorPickerHint: (hint: string | null) => void;
};

const StudioContext = createContext<StudioContextValue | undefined>(undefined);

export const StudioProvider = ({ children }: { children: React.ReactNode }) => {
  const savedColor =
    typeof window !== "undefined"
      ? localStorage.getItem("iconoma-studio-preview-color")
      : "#ffffff";
  const [previewColor, setPreviewColor] = useState<string>(
    savedColor || "#ffffff"
  );
  const [colorPickerHint, setColorPickerHint] = useState<string | null>(null);

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
