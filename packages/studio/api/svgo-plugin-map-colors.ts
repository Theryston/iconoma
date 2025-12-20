/* svgo-plugin-map-colors.ts */
import type { Plugin } from "svgo";

export type ColorMap = Record<string, string>;

export type MapColorsParams = {
  map: ColorMap;
  attributes?: string[];
  replaceInlineStyle?: boolean;
  replaceStyleElementText?: boolean;
};

type XastText = { type: "text"; value: string };
type XastElement = {
  type: "element";
  name: string;
  attributes?: Record<string, string>;
  children?: Array<XastElement | XastText | any>;
};

const DEFAULT_ATTRS = [
  "fill",
  "stroke",
  "stop-color",
  "flood-color",
  "lighting-color",
  "color",
] as const;

function clamp255(n: number) {
  return Math.max(0, Math.min(255, n));
}

function to2hex(n: number) {
  return clamp255(n).toString(16).padStart(2, "0");
}

function expandHex(hexNoHash: string) {
  const h = hexNoHash.toLowerCase();
  if (h.length === 3)
    return h
      .split("")
      .map((c) => c + c)
      .join(""); // rgb
  if (h.length === 4)
    return h
      .split("")
      .map((c) => c + c)
      .join(""); // rgba
  return h;
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${to2hex(r)}${to2hex(g)}${to2hex(b)}`;
}

function normalizeColor(input: string | undefined | null): string | null {
  if (input == null) return null;
  const v = String(input).trim();

  if (!v) return null;

  const lowered = v.toLowerCase();
  if (
    lowered === "none" ||
    lowered === "transparent" ||
    lowered === "currentcolor" ||
    lowered === "inherit" ||
    lowered === "initial" ||
    lowered === "unset" ||
    lowered.startsWith("url(")
  ) {
    return lowered === "currentcolor" ? "currentColor" : lowered;
  }

  const hex = v.match(/^#([0-9a-fA-F]{3,8})$/);
  if (hex) {
    const exp = expandHex(hex[1] ?? "");
    return `#${exp}`;
  }

  let m = v.match(
    /^rgba?\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)(?:\s*,\s*([0-9]*\.?[0-9]+))?\s*\)$/i
  );
  if (m) {
    const r = Number(m[1]);
    const g = Number(m[2]);
    const b = Number(m[3]);
    const a = m[4] != null ? Number(m[4]) : 1;
    if (!Number.isFinite(a) || a === 1) return rgbToHex(r, g, b);
    return `rgba(${r},${g},${b},${a})`;
  }

  m = v.match(
    /^rgb\(\s*([0-9]+)\s+([0-9]+)\s+([0-9]+)(?:\s*\/\s*([0-9]*\.?[0-9]+))?\s*\)$/i
  );
  if (m) {
    const r = Number(m[1]);
    const g = Number(m[2]);
    const b = Number(m[3]);
    const a = m[4] != null ? Number(m[4]) : 1;
    if (!Number.isFinite(a) || a === 1) return rgbToHex(r, g, b);
    return `rgb(${r} ${g} ${b} / ${a})`;
  }

  return lowered;
}

function parseStyle(styleText: string) {
  const out: Array<[string, string]> = [];
  const parts = String(styleText).split(";");
  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;
    const idx = p.indexOf(":");
    if (idx === -1) continue;
    const key = p.slice(0, idx).trim();
    const val = p.slice(idx + 1).trim();
    out.push([key, val]);
  }
  return out;
}

function serializeStyle(decls: Array<[string, string]>) {
  return decls.map(([k, v]) => `${k}: ${v}`).join("; ");
}

function makeNormalizedMap(map: ColorMap) {
  const norm = new Map<string, string>();
  for (const [from, to] of Object.entries(map || {})) {
    const k = normalizeColor(from);
    if (k) norm.set(k, String(to));
  }
  return norm;
}

export const mapColorsPluginBase = {
  name: "mapColors" as const,
  type: "visitor" as const,
  params: {
    map: {} as ColorMap,
    attributes: [...DEFAULT_ATTRS],
    replaceInlineStyle: true,
    replaceStyleElementText: false,
  },
  fn(_root: any, params: MapColorsParams) {
    const colorMap = makeNormalizedMap(params.map || {});
    const attrs = (
      params.attributes?.length ? params.attributes : [...DEFAULT_ATTRS]
    ) as string[];

    const replaceIfMapped = (raw: string | undefined) => {
      const n = normalizeColor(raw);
      if (!n) return null;
      return colorMap.get(n) ?? null;
    };

    const replaceInlineStyle = (styleValue: string) => {
      const decls = parseStyle(styleValue);
      let changed = false;

      for (let i = 0; i < decls.length; i++) {
        const [prop, val] = decls[i] ?? [];
        if (
          !/^(fill|stroke|stop-color|flood-color|lighting-color|color)$/i.test(
            prop ?? ""
          )
        )
          continue;

        const mapped = replaceIfMapped(val);
        if (mapped != null) {
          decls[i] = [prop ?? "", mapped ?? ""];
          changed = true;
        }
      }

      return changed ? serializeStyle(decls) : null;
    };

    const replaceInCssText = (cssText: string) => {
      let text = String(cssText);

      for (const [fromNorm, to] of colorMap.entries()) {
        if (!fromNorm.startsWith("#")) continue;

        const hex = fromNorm.slice(1);
        const hex6 = hex.length >= 6 ? hex.slice(0, 6) : hex;

        const canShort =
          hex6.length === 6 &&
          hex6[0] === hex6[1] &&
          hex6[2] === hex6[3] &&
          hex6[4] === hex6[5];

        const short = canShort ? `#${hex6[0]}${hex6[2]}${hex6[4]}` : null;

        const patterns = [new RegExp(`#${hex6}`, "gi")];
        if (short) patterns.push(new RegExp(short, "gi"));

        for (const re of patterns) text = text.replace(re, to);
      }

      return text;
    };

    return {
      element: {
        enter(node: XastElement) {
          if (!node.attributes) return;

          for (const a of attrs) {
            if (!(a in node.attributes)) continue;
            const mapped = replaceIfMapped(node.attributes[a]);
            if (mapped != null) node.attributes[a] = mapped;
          }

          if (params.replaceInlineStyle && node.attributes.style) {
            const next = replaceInlineStyle(node.attributes.style);
            if (next != null) node.attributes.style = next;
          }

          if (
            params.replaceStyleElementText &&
            node.name === "style" &&
            node.children
          ) {
            for (const child of node.children) {
              if (
                child &&
                child.type === "text" &&
                typeof child.value === "string"
              ) {
                (child as XastText).value = replaceInCssText(
                  (child as XastText).value
                );
              }
            }
          }
        },
      },
    };
  },
} as any;

export function mapColors(params: MapColorsParams): any {
  return {
    ...mapColorsPluginBase,
    params: {
      ...mapColorsPluginBase.params,
      ...params,
      map: params.map ?? {},
    },
  };
}

export default mapColorsPluginBase;
