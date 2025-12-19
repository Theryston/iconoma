import { Button } from "@iconoma/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@iconoma/ui/components/popover";
import { Input } from "@iconoma/ui/components/input";
import { useStudio } from "../../context";
import { ArrowRight } from "lucide-react";

export function ColorPicker() {
  const { previewColor, setPreviewColor, colorPickerHint } = useStudio();

  return (
    <div className="flex items-center gap-2">
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
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Preview Color</label>
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
