import { Button } from "@iconoma/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@iconoma/ui/components/popover";
import { Input } from "@iconoma/ui/components/input";
import { useStudio } from "../../context";
import { useConfig } from "../../hooks/config";
import { ArrowRight } from "lucide-react";
import { ScrollArea } from "@iconoma/ui/components/scroll-area";
import { Separator } from "@iconoma/ui/components/separator";

export function ColorPicker() {
  const {
    previewColor,
    setPreviewColor,
    colorPickerHint,
    colorVariableValues,
    setColorVariableValue,
  } = useStudio();
  const { data: config } = useConfig();
  const colorVariables = config?.colorVariables || [];

  const getColorForVariable = (variable: string): string => {
    return colorVariableValues[variable] || "#ffffff";
  };

  return (
    <div className="flex items-center gap-2 w-fit whitespace-nowrap">
      {colorPickerHint && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>{colorPickerHint}</span>
          <ArrowRight className="size-4" />
        </div>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="relative overflow-hidden"
            aria-label="Select preview color"
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: previewColor }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="end">
          <ScrollArea className="max-h-[60vh]">
            <div className="flex flex-col gap-4 pr-4">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium">currentColor</label>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Input
                      type="color"
                      value={previewColor}
                      onChange={(e) => setPreviewColor(e.target.value)}
                      className="h-10 w-30 cursor-pointer border-none p-0"
                      aria-label="Color picker"
                    />
                  </div>
                  <Input
                    type="text"
                    value={previewColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        setPreviewColor(value);
                      }
                    }}
                    placeholder="#000000"
                    className="w-20 font-mono text-sm"
                    aria-label="Color hex value"
                  />
                </div>
              </div>

              {colorVariables.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium">
                      Color Variables
                    </label>
                    <div className="flex flex-col gap-3">
                      {colorVariables.map((variable: string) => {
                        const currentColor = getColorForVariable(variable);
                        return (
                          <div key={variable} className="flex flex-col gap-2">
                            <label className="text-xs text-muted-foreground font-mono">
                              {variable}
                            </label>
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <Input
                                  type="color"
                                  value={currentColor}
                                  onChange={(e) =>
                                    setColorVariableValue(
                                      variable,
                                      e.target.value
                                    )
                                  }
                                  className="h-10 w-30 cursor-pointer border-none p-0"
                                  aria-label={`Color picker for ${variable}`}
                                />
                              </div>
                              <Input
                                type="text"
                                value={currentColor}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                                    setColorVariableValue(variable, value);
                                  }
                                }}
                                placeholder="#000000"
                                className="w-20 font-mono text-sm"
                                aria-label={`Color hex value for ${variable}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
