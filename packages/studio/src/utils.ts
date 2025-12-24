export function detectSvgColors(svgContent: string): string[] {
  if (!svgContent || typeof svgContent !== "string") {
    return [];
  }

  const colors = new Set<string>();

  const ignoredValues = new Set([
    "none",
    "transparent",
    "currentcolor",
    "currentColor",
    "inherit",
    "initial",
    "unset",
  ]);

  const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
  const rgbPattern =
    /^rgba?\(\s*\d+(?:\.\d+)?%?\s*,\s*\d+(?:\.\d+)?%?\s*,\s*\d+(?:\.\d+)?%?(?:\s*,\s*[\d.]+)?\s*\)$/;
  const hslPattern =
    /^hsla?\(\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?%\s*,\s*\d+(?:\.\d+)?%(?:\s*,\s*[\d.]+)?\s*\)$/;
  const namedColorPattern = /^[a-zA-Z]+$/;

  function addColorIfValid(value: string): void {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length === 0) return;

    const lower = trimmed.toLowerCase();

    if (trimmed.startsWith("--")) return;

    if (ignoredValues.has(lower)) return;

    if (
      hexPattern.test(trimmed) ||
      rgbPattern.test(trimmed) ||
      hslPattern.test(trimmed) ||
      (namedColorPattern.test(trimmed) && !trimmed.startsWith("--"))
    ) {
      colors.add(trimmed);
    }
  }

  const styleRegex = /style\s*=\s*["']([^"']+)["']/gi;
  let styleMatch: RegExpExecArray | null;
  while ((styleMatch = styleRegex.exec(svgContent)) !== null) {
    const styleContent = styleMatch[1];
    if (!styleContent) continue;

    const styleColorRegex =
      /(?:^|;)\s*(?:fill|stroke|color|stop-color|flood-color|lighting-color)\s*:\s*([^;]+)/gi;
    let colorMatch: RegExpExecArray | null;
    while ((colorMatch = styleColorRegex.exec(styleContent)) !== null) {
      const colorValue = colorMatch[1];
      if (colorValue) {
        addColorIfValid(colorValue);
      }
    }
  }

  const attributeColorRegex =
    /\b(fill|stroke|color|stop-color|flood-color|lighting-color)\s*=\s*["']([^"']+)["']/gi;
  let attrMatch: RegExpExecArray | null;
  while ((attrMatch = attributeColorRegex.exec(svgContent)) !== null) {
    const colorValue = attrMatch[2];
    if (colorValue) {
      addColorIfValid(colorValue);
    }
  }

  const hexGlobalRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
  let hexMatch;
  while ((hexMatch = hexGlobalRegex.exec(svgContent)) !== null) {
    const beforeMatch = svgContent.substring(
      Math.max(0, hexMatch.index - 2),
      hexMatch.index
    );
    if (!beforeMatch.endsWith("--")) {
      addColorIfValid(hexMatch[0]);
    }
  }

  const rgbGlobalRegex =
    /rgba?\(\s*\d+(?:\.\d+)?%?\s*,\s*\d+(?:\.\d+)?%?\s*,\s*\d+(?:\.\d+)?%?(?:\s*,\s*[\d.]+)?\s*\)/g;
  let rgbMatch;
  while ((rgbMatch = rgbGlobalRegex.exec(svgContent)) !== null) {
    const beforeMatch = svgContent.substring(
      Math.max(0, rgbMatch.index - 2),
      rgbMatch.index
    );
    if (!beforeMatch.endsWith("--")) {
      addColorIfValid(rgbMatch[0]);
    }
  }

  const hslGlobalRegex =
    /hsla?\(\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?%\s*,\s*\d+(?:\.\d+)?%(?:\s*,\s*[\d.]+)?\s*\)/g;
  let hslMatch;
  while ((hslMatch = hslGlobalRegex.exec(svgContent)) !== null) {
    const beforeMatch = svgContent.substring(
      Math.max(0, hslMatch.index - 2),
      hslMatch.index
    );
    if (!beforeMatch.endsWith("--")) {
      addColorIfValid(hslMatch[0]);
    }
  }

  return Array.from(colors);
}
