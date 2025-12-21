import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@iconoma/ui/components/dialog";
import { Button } from "@iconoma/ui/components/button";
import { Input } from "@iconoma/ui/components/input";
import { Field, FieldError, FieldLabel } from "@iconoma/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@iconoma/ui/components/select";
import { useCreateIcon } from "../hooks/icons";
import { useConfig, useSetConfig } from "../hooks/config";
import { toast } from "@iconoma/ui/components/sonner";
import { Controller } from "react-hook-form";
import { detectSvgColors } from "../utils";
import { ScrollArea } from "@iconoma/ui/components/scroll-area";

const iconFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tags: z.string().optional().default(""),
  content: z.string().min(1, "SVG content is required"),
});

type IconFormInput = z.input<typeof iconFormSchema>;

type IconFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  svgContent: string;
  onSuccess: (iconKey: string) => void;
  mode: "create" | "edit";
  initialData?: {
    name: string;
    tags: string[];
    svgContent: string;
    colorVariableKeys?: string[];
  };
  initialName?: string;
};

export function IconFormModal({
  open,
  onOpenChange,
  svgContent,
  onSuccess,
  mode,
  initialData,
  initialName,
}: IconFormModalProps) {
  const createIcon = useCreateIcon();
  const { data: config } = useConfig();
  const setConfig = useSetConfig();
  const colors = useMemo(() => detectSvgColors(svgContent), [svgContent]);

  const colorMap = useMemo(() => {
    if (colors.length === 1 && colors[0]) {
      return { [colors[0]]: "currentColor" };
    }
    return null;
  }, [colors]);

  const [colorMapping, setColorMapping] = useState<Record<string, string>>({});
  const [colorMappingErrors, setColorMappingErrors] = useState<
    Record<string, string>
  >({});
  const [creatingVariableFor, setCreatingVariableFor] = useState<string | null>(
    null
  );
  const [newVariableName, setNewVariableName] = useState<string>("");

  // Initialize color mapping for edit mode
  useEffect(() => {
    if (open && mode === "edit" && initialData?.colorVariableKeys) {
      const detectedColors = detectSvgColors(svgContent);
      const initialMapping: Record<string, string> = {};

      // Try to reverse-map colorVariableKeys to detected colors
      // This is best-effort - user may need to adjust
      detectedColors.forEach((color, index) => {
        const varKey = initialData.colorVariableKeys?.[index];
        if (varKey) {
          if (varKey === "currentColor") {
            initialMapping[color] = "currentColor";
          } else if (varKey.startsWith("var(--")) {
            initialMapping[color] = varKey;
          } else {
            // Try to match with config color variables
            const varName = varKey.replace("--", "");
            if (config?.colorVariables.includes(`--${varName}`)) {
              initialMapping[color] = `var(--${varName})`;
            }
          }
        }
      });

      setColorMapping(initialMapping);
      setColorMappingErrors({});
      setCreatingVariableFor(null);
      setNewVariableName("");
    } else if (open && colors.length > 1 && mode === "create") {
      const initialMapping: Record<string, string> = {};
      colors.forEach((color, index) => {
        if (index === 0) {
          initialMapping[color] = "currentColor";
        }
      });
      setColorMapping(initialMapping);
      setColorMappingErrors({});
      setCreatingVariableFor(null);
      setNewVariableName("");
    }
  }, [open, mode, initialData, svgContent, colors, config]);

  const form = useForm<IconFormInput>({
    resolver: zodResolver(iconFormSchema),
    defaultValues: {
      name: "",
      tags: "",
      content: svgContent,
    },
  });

  useEffect(() => {
    if (open) {
      form.setValue("content", svgContent);
      if (mode === "edit" && initialData) {
        form.setValue("name", initialData.name);
        form.setValue("tags", initialData.tags.join(", "));
      } else if (initialName) {
        form.setValue("name", initialName);
      }
    }
  }, [open, svgContent, form, mode, initialData, initialName]);

  const handleSubmit = form.handleSubmit(async (data) => {
    const tagsArray = (data.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (colors.length > 1) {
      const errors: Record<string, string> = {};
      let hasErrors = false;

      colors.forEach((color) => {
        if (!colorMapping[color] || colorMapping[color].trim() === "") {
          errors[color] = "Please select a mapping for this color";
          hasErrors = true;
        }
      });

      if (hasErrors) {
        setColorMappingErrors(errors);
        toast.error(
          `Please map all colors before ${mode === "edit" ? "updating" : "creating"} the icon`
        );
        return;
      }

      setColorMappingErrors({});
    }

    const finalColorMap = colorMap || colorMapping;

    const filteredColorMap = Object.fromEntries(
      Object.entries(finalColorMap).filter(
        ([_, value]) => value !== "__KEEP_HARDCODE__"
      )
    );

    try {
      const result = await createIcon.mutateAsync({
        name: data.name,
        tags: tagsArray,
        content: data.content,
        colorMap:
          Object.keys(filteredColorMap).length > 0
            ? filteredColorMap
            : undefined,
      });

      toast.success(
        `Icon ${mode === "edit" ? "updated" : "created"} successfully!`
      );
      onOpenChange(false);
      form.reset();
      onSuccess(result.icon.name);
    } catch (error) {
      toast.error(
        `Failed to ${mode === "edit" ? "update" : "create"} icon. Please try again.`
      );
      console.error(
        `Error ${mode === "edit" ? "updating" : "creating"} icon:`,
        error
      );
    }
  });

  const colorVariables = config?.colorVariables || [];
  const mappingOptions = [
    { value: "currentColor", label: "currentColor" },
    ...colorVariables.map((varName: string) => ({
      value: `var(${varName})`,
      label: varName,
    })),
    { value: "__KEEP_HARDCODE__", label: "Keep hardcode" },
    { value: "__CREATE_NEW__", label: "+ Create new variable..." },
  ];

  const hasHardcodedColors = useMemo(() => {
    if (colors.length <= 1) return false;
    return Object.values(colorMapping).some(
      (value) => value === "__KEEP_HARDCODE__"
    );
  }, [colorMapping, colors.length]);

  const handleCreateVariable = async (color: string, variableName: string) => {
    if (!variableName.trim()) {
      toast.error("Variable name cannot be empty");
      return;
    }

    if (!variableName.startsWith("--")) {
      toast.error("Variable name must start with -- (e.g., --icons-secondary)");
      return;
    }

    if (colorVariables.includes(variableName)) {
      toast.error("This variable already exists");
      return;
    }

    if (!config) {
      toast.error("Config not loaded");
      return;
    }

    try {
      const updatedConfig = {
        ...config,
        colorVariables: [...colorVariables, variableName],
      };

      await setConfig.mutateAsync({
        config: updatedConfig,
        changes: [],
      });

      setColorMapping((prev) => ({
        ...prev,
        [color]: `var(${variableName})`,
      }));

      setCreatingVariableFor(null);
      setNewVariableName("");
      toast.success(`Variable ${variableName} created and mapped`);
    } catch (error) {
      toast.error("Failed to create variable");
      console.error("Error creating variable:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Icon" : "Create Icon"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the icon properties below."
              : "Enter the icon name and tags to create your icon."}
            {colors.length > 1 && " Map colors to variables below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ScrollArea className="max-h-[60vh]">
            <div className="flex flex-col gap-4 pr-4">
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="e.g. home, search, user"
                      disabled={mode === "edit"}
                      className={
                        form.formState.errors.name ? "border-destructive" : ""
                      }
                    />
                  )}
                />
                {form.formState.errors.name && (
                  <FieldError errors={[form.formState.errors.name]} />
                )}
              </Field>

              <Field>
                <FieldLabel>Tags (comma-separated)</FieldLabel>
                <Controller
                  name="tags"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="e.g. navigation, ui, icon"
                      className={
                        form.formState.errors.tags ? "border-destructive" : ""
                      }
                    />
                  )}
                />
                {form.formState.errors.tags && (
                  <FieldError errors={[form.formState.errors.tags]} />
                )}
              </Field>

              {colors.length > 1 && (
                <Field>
                  <FieldLabel>Color Mapping</FieldLabel>
                  <div className="flex flex-col gap-3 mt-3 rounded-lg border p-4 bg-muted/30">
                    {colors.map((color) => {
                      const hasError = !!colorMappingErrors[color];
                      return (
                        <div key={color} className="flex flex-col gap-1.5">
                          <div
                            className={`flex items-center gap-4 p-3 rounded-lg border bg-background ${
                              hasError ? "border-destructive" : ""
                            }`}
                          >
                            <div
                              className="size-10 rounded border shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-mono truncate">
                                {color}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm text-muted-foreground">
                                →
                              </span>
                              {creatingVariableFor === color ? (
                                <div className="flex items-center gap-2 w-[200px]">
                                  <Input
                                    value={newVariableName}
                                    onChange={(e) =>
                                      setNewVariableName(e.target.value)
                                    }
                                    placeholder="e.g. --icons-secondary"
                                    className="flex-1 font-mono text-sm"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleCreateVariable(
                                          color,
                                          newVariableName
                                        );
                                      } else if (e.key === "Escape") {
                                        setCreatingVariableFor(null);
                                        setNewVariableName("");
                                      }
                                    }}
                                    autoFocus
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() =>
                                      handleCreateVariable(
                                        color,
                                        newVariableName
                                      )
                                    }
                                    disabled={setConfig.isPending}
                                  >
                                    Add
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setCreatingVariableFor(null);
                                      setNewVariableName("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Select
                                  value={colorMapping[color] || ""}
                                  onValueChange={(value) => {
                                    if (value === "__CREATE_NEW__") {
                                      setCreatingVariableFor(color);
                                      setNewVariableName("");
                                    } else {
                                      setColorMapping((prev) => ({
                                        ...prev,
                                        [color]: value,
                                      }));
                                      if (colorMappingErrors[color]) {
                                        setColorMappingErrors(
                                          (prev: Record<string, string>) => {
                                            const newErrors = { ...prev };
                                            delete newErrors[color];
                                            return newErrors;
                                          }
                                        );
                                      }
                                    }
                                  }}
                                >
                                  <SelectTrigger
                                    className={`w-[200px] ${
                                      hasError ? "border-destructive" : ""
                                    }`}
                                  >
                                    <SelectValue placeholder="Select mapping..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mappingOptions.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>
                          {hasError && (
                            <p className="text-sm text-destructive px-3">
                              {colorMappingErrors[color]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {hasHardcodedColors && (
                    <div className="mt-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
                      <p className="font-medium">
                        Warning: Hardcoded colors detected
                      </p>
                      <p className="mt-1 text-xs">
                        Colors marked as "keep hardcode" will not change based
                        on text color or CSS variables. This option is only
                        recommended for very specific cases, like the Google
                        logo where you really need to fix the color, but is not
                        recommended for most use cases.
                      </p>
                    </div>
                  )}
                </Field>
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createIcon.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createIcon.isPending}>
              {createIcon.isPending
                ? mode === "edit"
                  ? "Updating..."
                  : "Creating..."
                : mode === "edit"
                  ? "Update Icon"
                  : "Create Icon"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
