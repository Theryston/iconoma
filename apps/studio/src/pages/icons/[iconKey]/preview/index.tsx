import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useConfig } from "../../../../hooks/config";
import { useIcon } from "../../../../hooks/icons";
import { useStudio } from "../../../../context";
import { SvgPreview } from "../../../../components/svg-preview";
import { Slider } from "@iconoma/ui/components/slider";
import { Button } from "@iconoma/ui/components/button";
import { ArrowDown } from "lucide-react";
import confetti from "canvas-confetti";
import type { ExtraTarget } from "../../../../../api/types";

export default function IconPreview() {
  const { iconKey } = useParams<{ iconKey: string }>();
  const navigate = useNavigate();
  const { data: iconData, isPending, error } = useIcon(iconKey || "");
  const { data: config } = useConfig();
  const { setColorPickerHint } = useStudio();
  const [size, setSize] = useState([50]);
  const [activeTab, setActiveTab] = useState<string>("");
  const confettiTriggered = useRef(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confettiTriggered.current && previewRef.current && iconData) {
      const rect = previewRef.current.getBoundingClientRect();
      const x = (rect.left + rect.right) / 2 / window.innerWidth;
      const y = (rect.top + rect.bottom) / 2 / window.innerHeight;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
      });
      confettiTriggered.current = true;
    }

    setColorPickerHint(
      "Look how this icon perfectly responds when you change the text color"
    );

    return () => {
      setColorPickerHint(null);
    };
  }, [setColorPickerHint, iconData]);

  const tabs = useMemo(() => {
    if (!iconData || !config) return [];

    const availableTabs: string[] = [];

    if (config.extraTargets.some((t: ExtraTarget) => t.targetId === "react")) {
      availableTabs.push("react");
    }

    if (config && !config.svg.inLock) {
      availableTabs.push("svg");
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
  }, [config, activeTab, iconData]);

  const getSvgPath = () => {
    if (!config || !iconData || config.svg.inLock) return "";
    const isFile = iconData.icon.svg.content.startsWith("file://");
    if (isFile) {
      return iconData.icon.svg.content.replace("file://", "");
    }
    return "";
  };

  const getReactPath = () => {
    if (!config || !iconData) return "";
    const reactTarget = config.extraTargets.find(
      (t: ExtraTarget) => t.targetId === "react"
    );
    if (!reactTarget) return "";
    return reactTarget.outputPath.replace("{name}", iconData.icon.name);
  };

  const getReactNativePath = () => {
    if (!config || !iconData) return "";
    const rnTarget = config.extraTargets.find(
      (t: ExtraTarget) => t.targetId === "react-native"
    );
    if (!rnTarget) return "";
    return rnTarget.outputPath.replace("{name}", iconData.icon.name);
  };

  if (isPending) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-muted-foreground">Loading icon...</div>
      </div>
    );
  }

  if (error || !iconData) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-destructive">Icon not found</div>
          <Button onClick={() => navigate("/")} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const { icon, pascalName, svgContent } = iconData;

  const svgExample = `<img src="${getSvgPath()}" alt="${icon.name}" />`;

  const reactExample = `import { ${pascalName} } from "${getReactPath()}";

<${pascalName} className="text-blue-500 text-2xl" />`;

  const reactNativeExample = `import { ${pascalName} } from "${getReactNativePath()}";

<${pascalName} color="#3B82F6" size={24} />`;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 p-6">
      <div className="grid grid-cols-[1fr_450px] h-full gap-6">
        <div className="flex-1 overflow-hidden rounded-xl border bg-gradient-to-br from-card to-card/50 p-12 shadow-sm">
          <div className="flex h-full flex-col items-center justify-center gap-6 relative">
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span>Look how it respects the font size perfectly here</span>
                <ArrowDown className="size-4" />
              </div>
              <div className="flex w-full max-w-lg flex-col gap-3">
                <Slider
                  value={size}
                  onValueChange={setSize}
                  min={5}
                  max={300}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-sm font-medium text-foreground">
                  {size[0]}px
                </div>
              </div>
            </div>
            <div
              className="flex items-center justify-center transition-all duration-300 ease-out"
              ref={previewRef}
            >
              <SvgPreview
                content={svgContent}
                className="h-full w-full"
                style={{
                  width: `${size[0]}px`,
                  height: `${size[0]}px`,
                  maxWidth: "500px",
                  maxHeight: "500px",
                }}
              />
            </div>
          </div>
        </div>

        {tabs.length > 0 && (
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
                <pre className="rounded-lg bg-background border p-4 text-sm overflow-x-auto">
                  <code className="text-foreground">{svgExample}</code>
                </pre>
              )}
              {activeTab === "react" && (
                <pre className="rounded-lg bg-background border p-4 text-sm overflow-x-auto">
                  <code className="text-foreground">{reactExample}</code>
                </pre>
              )}
              {activeTab === "react-native" && (
                <pre className="rounded-lg bg-background border p-4 text-sm overflow-x-auto">
                  <code className="text-foreground">{reactNativeExample}</code>
                </pre>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => navigate("/")} size="lg" className="min-w-24">
          Back to home
        </Button>
      </div>
    </div>
  );
}
