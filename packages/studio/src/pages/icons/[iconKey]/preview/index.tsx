import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useIcon } from "../../../../hooks/icons";
import { useStudio } from "../../../../context";
import { SvgPreview } from "../../../../components/svg-preview";
import { IconExamples } from "../../../../components/icon-examples";
import { Slider } from "@iconoma/ui/components/slider";
import { Button } from "@iconoma/ui/components/button";
import { ArrowDown } from "lucide-react";
import confetti from "canvas-confetti";

export default function IconPreview() {
  const { iconKey } = useParams<{ iconKey: string }>();
  const navigate = useNavigate();
  const { data: iconData, isPending, error } = useIcon(iconKey || "");
  const { setColorPickerHint } = useStudio();
  const [size, setSize] = useState([50]);
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

  const { pascalName, svgContent, icon } = iconData;

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

        <IconExamples
          iconKey={iconKey || ""}
          pascalName={pascalName}
          svgContent={svgContent}
          colorVariableKeys={icon.colorVariableKeys}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => navigate("/")} size="lg" className="min-w-24">
          Back to home
        </Button>
      </div>
    </div>
  );
}
