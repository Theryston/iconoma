import { useState, useMemo, useEffect } from "react";
import { useConfig } from "../hooks/config";
import { useStudio } from "../context";
import { Button } from "@iconoma/ui/components/button";
import { toast } from "@iconoma/ui/components/sonner";
import { Copy, Check } from "lucide-react";
import type { ExtraTarget } from "../../api/types";

type IconExamplesProps = {
  iconKey: string;
  componentName: string;
  svgContent: string;
  colorVariableKeys?: string[];
};

export function IconExamples({
  iconKey,
  componentName,
  svgContent,
  colorVariableKeys = [],
}: IconExamplesProps) {
  const { data: config } = useConfig();
  const { previewColor, colorVariableValues } = useStudio();
  const [activeTab, setActiveTab] = useState<string>("");
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const tabs = useMemo(() => {
    if (!config) return [];

    const availableTabs: string[] = [];

    if (config && !config.svg.inLock) {
      availableTabs.push("svg");
    }

    if (config.extraTargets.some((t: ExtraTarget) => t.targetId === "react")) {
      availableTabs.push("react");
    }

    if (
      config.extraTargets.some(
        (t: ExtraTarget) => t.targetId === "react-native"
      )
    ) {
      availableTabs.push("react-native");
    }

    if (availableTabs.length > 0 && !activeTab && availableTabs[0]) {
      setActiveTab(availableTabs[0]);
    }

    return availableTabs;
  }, [config, activeTab]);

  useEffect(() => {
    if (tabs.length > 0 && !activeTab && tabs[0]) {
      setActiveTab(tabs[0]);
    }
  }, [tabs, activeTab]);

  const getReactPath = () => {
    if (!config) return "";
    const reactTarget = config.extraTargets.find(
      (t: ExtraTarget) => t.targetId === "react"
    );
    if (!reactTarget) return "";
    return reactTarget.outputPath.replace("{name}", iconKey);
  };

  const getReactNativePath = () => {
    if (!config) return "";
    const rnTarget = config.extraTargets.find(
      (t: ExtraTarget) => t.targetId === "react-native"
    );
    if (!rnTarget) return "";
    return rnTarget.outputPath.replace("{name}", iconKey);
  };

  const cssVariables = colorVariableKeys.filter(
    (key) => key.startsWith("var(") && key.endsWith(")")
  );

  const cssVarNames = cssVariables
    .map((varStr) => {
      const match = varStr.match(/var\((--[^)]+)\)/);
      return match ? match[1] : null;
    })
    .filter(Boolean) as string[];

  const generateReactExample = () => {
    const importLine = `import { ${componentName} } from "${getReactPath()}";`;
    const styleEntries: string[] = [];

    styleEntries.push(`color: "${previewColor}"`);

    cssVarNames.forEach((varName) => {
      const colorValue = colorVariableValues[varName] || "#6B7280";
      styleEntries.push(`"${varName}": "${colorValue}"`);
    });

    if (styleEntries.length === 0) {
      return `${importLine}

<div className="text-2xl">
  <${componentName} />
</div>`;
    }

    const styleObject = `{ ${styleEntries.join(", ")} }`;
    return `${importLine}

<div style={${styleObject}} className="text-2xl">
  <${componentName} />
</div>`;
  };

  const generateSvgExample = () => {
    const styleProps: string[] = [];

    styleProps.push(`color: "${previewColor}"`);

    cssVarNames.forEach((varName) => {
      const colorValue = colorVariableValues[varName] || "#6B7280";
      styleProps.push(`${varName}: "${colorValue}"`);
    });

    return `<div style="${styleProps.join("; ")}">
${svgContent}
</div>`;
  };

  const generateReactNativeExample = () => {
    const importLine = `import { ${componentName} } from "${getReactNativePath()}";`;
    const props: string[] = [];

    props.push(`color="${previewColor}"`);

    props.push(`size={24}`);

    let example = `${importLine}

<${componentName} ${props.join(" ")} />`;

    return example;
  };

  const svgExample = generateSvgExample();
  const reactExample = generateReactExample();
  const reactNativeExample = generateReactNativeExample();

  const handleCopy = async (code: string, tab: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedTab(tab);
      toast.success("Code copied to clipboard");
      setTimeout(() => setCopiedTab(null), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden w-full">
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary bg-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tab === "svg"
              ? "Pure SVG"
              : tab === "react"
                ? "React"
                : "React Native"}
          </button>
        ))}
      </div>
      <div className="p-6">
        {activeTab === "svg" && (
          <div className="relative">
            <pre className="rounded-lg bg-background border p-4 text-sm overflow-x-auto pr-12">
              <code className="text-foreground">{svgExample}</code>
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              onClick={() => handleCopy(svgExample, "svg")}
            >
              {copiedTab === "svg" ? (
                <Check className="size-4 text-green-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        )}
        {activeTab === "react" && (
          <div className="relative">
            <pre className="rounded-lg bg-background border p-4 text-sm overflow-x-auto pr-12">
              <code className="text-foreground">{reactExample}</code>
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              onClick={() => handleCopy(reactExample, "react")}
            >
              {copiedTab === "react" ? (
                <Check className="size-4 text-green-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        )}
        {activeTab === "react-native" && (
          <div className="relative">
            <pre className="rounded-lg bg-background border p-4 text-sm overflow-x-auto pr-12">
              <code className="text-foreground">{reactNativeExample}</code>
            </pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              onClick={() => handleCopy(reactNativeExample, "react-native")}
            >
              {copiedTab === "react-native" ? (
                <Check className="size-4 text-green-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
