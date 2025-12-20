import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "../../../components/theme-provider";
import {
  SandpackCodeEditor,
  SandpackProvider,
  useActiveCode,
} from "@iconoma/ui/components/sandpack";
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
import { useCreateIcon } from "../../../hooks/icons";
import { useConfig, useSetConfig } from "../../../hooks/config";
import { toast } from "@iconoma/ui/components/sonner";
import { Controller } from "react-hook-form";
import { SvgPreview } from "../../../components/svg-preview";
import { useNavigate } from "react-router";
import { detectSvgColors } from "../../../utils";
import { ScrollArea } from "@iconoma/ui/components/scroll-area";

const createIconFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tags: z.string().optional().default(""),
  content: z.string().min(1, "SVG content is required"),
});

type CreateIconFormInput = z.input<typeof createIconFormSchema>;

function SvgEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { theme } = useTheme();

  return (
    <div className="h-full w-full overflow-hidden">
      <SandpackProvider
        theme={theme === "system" ? "auto" : theme}
        files={{
          "icon.svg": {
            code: value,
          },
        }}
        options={{
          activeFile: "icon.svg",
        }}
        className="!h-full !w-full"
      >
        <EditorContent onChange={onChange} />
      </SandpackProvider>
    </div>
  );
}

function EditorContent({ onChange }: { onChange: (value: string) => void }) {
  const { code } = useActiveCode();

  useEffect(() => {
    onChange(code);
  }, [code, onChange]);

  return <SandpackCodeEditor showInlineErrors style={{ height: "100%" }} />;
}

function CreateIconModal({
  open,
  onOpenChange,
  svgContent,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  svgContent: string;
  onSuccess: (iconKey: string) => void;
}) {
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

  useEffect(() => {
    if (open && colors.length > 1) {
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
  }, [open, colors]);

  const form = useForm<CreateIconFormInput>({
    resolver: zodResolver(createIconFormSchema),
    defaultValues: {
      name: "",
      tags: "",
      content: svgContent,
    },
  });

  useEffect(() => {
    if (open) {
      form.setValue("content", svgContent);
    }
  }, [open, svgContent, form]);

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
        toast.error("Please map all colors before creating the icon");
        return;
      }

      setColorMappingErrors({});
    }

    const finalColorMap = colorMap || colorMapping;

    try {
      const result = await createIcon.mutateAsync({
        name: data.name,
        tags: tagsArray,
        content: data.content,
        colorMap:
          Object.keys(finalColorMap).length > 0 ? finalColorMap : undefined,
      });

      toast.success("Icon created successfully!");
      onOpenChange(false);
      form.reset();
      onSuccess(result.icon.name);
    } catch (error) {
      toast.error("Failed to create icon. Please try again.");
      console.error("Error creating icon:", error);
    }
  });

  const colorVariables = config?.colorVariables || [];
  const mappingOptions = [
    { value: "currentColor", label: "currentColor" },
    ...colorVariables.map((varName: string) => ({
      value: `var(${varName})`,
      label: varName,
    })),
    { value: "__CREATE_NEW__", label: "+ Create new variable..." },
  ];

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
          <DialogTitle>Create Icon</DialogTitle>
          <DialogDescription>
            Enter the icon name and tags to create your icon.
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
              {createIcon.isPending ? "Creating..." : "Create Icon"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CreateIcon() {
  const navigate = useNavigate();
  const [svgContent, setSvgContent] = useState(
    '<svg width="700" height="700" viewBox="0 0 700 700" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M150 250H155H350H550H685C642.5 105 507.5 0 350 0C192.5 0 57.5 105 15 250H150Z" fill="#E5E5E5"/>\n<path d="M575 300V350C575 392.5 542.5 425 500 425H435C402.5 425 375 405 365 372.5L350 340L335 375C325 405 297.5 425 265 425H200C157.5 425 125 392.5 125 350V300H5C2.5 317.5 0 332.5 0 350C0 542.5 157.5 700 350 700C542.5 700 700 542.5 700 350C700 332.5 697.5 317.5 695 300H575ZM497.5 495C457.5 530 405 550 350 550C335 550 325 540 325 525C325 510 335 500 350 500C392.5 500 432.5 485 465 455C475 445 490 447.5 500 457.5C510 470 510 485 497.5 495Z" fill="#E5E5E5"/>\n</svg>'
  );
  const [modalOpen, setModalOpen] = useState(false);

  const isValidSvg = useMemo(() => {
    if (!svgContent || svgContent.trim().length === 0) return false;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const parseError = doc.querySelector("parsererror");
      return !parseError;
    } catch {
      return false;
    }
  }, [svgContent]);

  const handleIconCreated = (iconKey: string) => {
    navigate(`/icons/${iconKey}/preview`);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4">
      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 overflow-hidden rounded-lg border">
          <SvgEditor value={svgContent} onChange={setSvgContent} />
        </div>
        <div className="flex-1 overflow-hidden rounded-lg border">
          <div className="flex h-full w-full items-center justify-center bg-muted/30 p-8 relative">
            <div className="absolute top-4 left-4 max-w-xs flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">
                Your original SVG preview
              </p>
              <p className="text-sm text-muted-foreground">
                I know this icon looks rough, no worries. I'll take care of
                everything for you. Hit "Create Icon" and watch the magic.
              </p>
            </div>

            <SvgPreview
              content={svgContent}
              className="h-[50%] w-[50%] flex flex-col items-center justify-center"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => setModalOpen(true)}
          disabled={!isValidSvg}
          size="lg"
        >
          Create Icon
        </Button>
      </div>

      <CreateIconModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        svgContent={svgContent}
        onSuccess={handleIconCreated}
      />
    </div>
  );
}
