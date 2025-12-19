import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@iconoma/ui/components/accordion";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
} from "@iconoma/ui/components/field";
import { useTheme } from "../../theme-provider";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { configSchema, type ConfigInput, type Config } from "../schema";
import { Button } from "@iconoma/ui/components/button";
import { cn } from "@iconoma/ui/lib/utils";
import { Input } from "@iconoma/ui/components/input";
import { Label } from "@iconoma/ui/components/label";
import { Checkbox } from "@iconoma/ui/components/checkbox";
import { Check } from "lucide-react";
import { AVAILABLE_TARGETS } from "../../../constants";
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackProvider,
  useActiveCode,
  keymap,
} from "@iconoma/ui/components/sandpack";
import { useConfigChanges, useSetConfig } from "../../../hooks/config";
import { toast } from "@iconoma/ui/components/sonner";
import type { Change } from "../../../../api/types";
import { ScrollArea } from "@iconoma/ui/components/scroll-area";

export function ConfigFormStep({
  form,
  onNextStep,
  onComplete,
}: {
  form: UseFormReturn<ConfigInput>;
  onNextStep: (changes: Change[], config: Config) => void;
  onComplete: () => void;
}) {
  const [accordionValue, setAccordionValue] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const configChanges = useConfigChanges();
  const setConfig = useSetConfig();

  const handleSubmit = form.handleSubmit(async (data: ConfigInput) => {
    const result = configSchema.safeParse(data);

    if (!result.success) {
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof ConfigInput;
        form.setError(field, { message: error.message });
      });
      return;
    }

    const validatedConfig = result.data;

    try {
      const response = await configChanges.mutateAsync(validatedConfig);
      const changes: Change[] = response?.changes || [];

      if (changes.length === 0) {
        await setConfig.mutateAsync({
          config: validatedConfig,
          changes: [],
        });
        toast.success("Configuration saved successfully");
        onComplete();
      } else {
        onNextStep(changes, validatedConfig);
      }
    } catch {
      // ignore
    }
  });

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <ScrollArea className="max-h-[60vh]">
        <div className="flex flex-col gap-4">
          {!form.watch("svg.inLock") && (
            <Controller
              name="svg.folder"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>SVG Folder</FieldLabel>
                  <Input
                    placeholder="e.g. ./icons"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}

          <Controller
            name="svg.inLock"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <Label className="flex items-start gap-3 rounded-lg border p-3">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(e) => {
                      field.onChange(e);
                      form.setValue("svg.folder", null, {
                        shouldValidate: true,
                      });
                      form.clearErrors("extraTargets");
                    }}
                  />
                  <div className="grid gap-1.5 font-normal">
                    <p className="text-sm leading-none">
                      SVG in Lock (NOT RECOMMENDED)
                    </p>
                    <p className="text-muted-foreground text-xs">
                      When enabled, the SVG will not be exported to a folder, it
                      will be included in the iconoma.lock.json file
                    </p>
                  </div>
                </Label>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <ExtraTargetsSection form={form} />
          <Accordion
            type="multiple"
            value={accordionValue}
            onValueChange={setAccordionValue}
          >
            <Controller
              name="svgo"
              control={form.control}
              render={({ field, fieldState }) => (
                <AccordionItem value="svgo">
                  <AccordionTrigger
                    className={cn(fieldState.error && "text-destructive")}
                  >
                    SVGO Config
                  </AccordionTrigger>
                  <AccordionContent>
                    <Field>
                      <SVGOConfig
                        onConfigChange={field.onChange}
                        value={field.value}
                        onSubmit={handleSubmit}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  </AccordionContent>
                </AccordionItem>
              )}
            />
          </Accordion>
        </div>
      </ScrollArea>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => onComplete()}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting || configChanges.isPending}
        >
          {configChanges.isPending
            ? "Checking changes..."
            : form.formState.isSubmitting
              ? "Saving..."
              : "Continue"}
        </Button>
      </div>
    </form>
  );
}

function SVGOConfig({
  onConfigChange,
  value,
  onSubmit,
}: {
  value: string;
  onConfigChange: (config: string) => void;
  onSubmit: () => void;
}) {
  const { theme } = useTheme();

  return (
    <div className="h-full w-full overflow-hidden">
      <SandpackProvider
        theme={theme === "system" ? "auto" : theme}
        files={{
          "index.json": {
            code: value,
          },
        }}
        options={{
          activeFile: "index.json",
        }}
      >
        <SandpackLayout>
          <ConfigEditor onConfigChange={onConfigChange} onSubmit={onSubmit} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

function ConfigEditor({
  onConfigChange,
  onSubmit,
}: {
  onConfigChange: (config: string) => void;
  onSubmit: () => void;
}) {
  const { code } = useActiveCode();

  useEffect(() => {
    onConfigChange(code);
  }, [code, onConfigChange]);

  const customKeymap = useMemo(
    () =>
      keymap.of([
        {
          key: "Mod-Enter",
          run: () => {
            onSubmit();
            return true;
          },
        },
      ]),
    [onSubmit]
  );

  return <SandpackCodeEditor showInlineErrors extensions={[customKeymap]} />;
}

function ExtraTargetsSection({ form }: { form: UseFormReturn<ConfigInput> }) {
  const extraTargets = form.watch("extraTargets");
  const fieldState = form.formState.errors.extraTargets;

  const toggleTarget = (targetId: string) => {
    const currentTargets = form.getValues("extraTargets");
    const existingIndex = currentTargets?.findIndex(
      (t) => t.targetId === targetId
    );

    if (existingIndex !== -1) {
      const newTargets = currentTargets?.filter((_, i) => i !== existingIndex);
      form.setValue("extraTargets", newTargets, { shouldValidate: true });
    } else {
      const targetConfig = AVAILABLE_TARGETS.find((t) => t.id === targetId);
      if (targetConfig) {
        const newTargets = [
          ...(currentTargets ?? []),
          {
            targetId,
            outputPath: `./components/${targetConfig.id}/icons/{name}${targetConfig.extension[0]}`,
          },
        ];
        form.setValue("extraTargets", newTargets, { shouldValidate: true });
      }
    }
  };

  const updateTargetPath = (index: number, path: string) => {
    const currentTargets = form.getValues("extraTargets");
    const newTargets = [...(currentTargets ?? [])];
    const currentTarget = newTargets[index];
    if (currentTarget) {
      newTargets[index] = { ...currentTarget, outputPath: path };
      form.setValue("extraTargets", newTargets, { shouldValidate: true });
    }
  };

  const isTargetSelected = (targetId: string) => {
    return extraTargets?.some((t) => t.targetId === targetId);
  };

  const getTargetError = (index: number) => {
    if (
      fieldState &&
      typeof fieldState === "object" &&
      !("message" in fieldState) &&
      fieldState[index]
    ) {
      return fieldState[index];
    }
    return null;
  };

  return (
    <Field>
      <FieldLabel>Extra Targets</FieldLabel>
      <FieldDescription>
        Select additional targets to generate icon components for.
      </FieldDescription>

      <div className="flex flex-col gap-3 mt-3">
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TARGETS.map((target) => {
            const selected = isTargetSelected(target.id);
            const Icon = target.icon;

            return (
              <Button
                key={target.id}
                type="button"
                variant="selectable"
                size="default"
                selected={selected}
                onClick={() => toggleTarget(target.id)}
                className="rounded-lg px-4 py-2.5"
              >
                <Icon className="size-4 shrink-0" />
                <span>{target.name}</span>
                {selected && (
                  <div className="ml-1 flex items-center justify-center rounded-full bg-primary p-0.5">
                    <Check className="size-3 text-primary-foreground" />
                  </div>
                )}
              </Button>
            );
          })}
        </div>

        {(extraTargets ?? []).length > 0 && (
          <div className="flex flex-col gap-3 rounded-lg border p-4 bg-muted/30">
            {(extraTargets ?? []).map((target, index) => {
              const targetConfig = AVAILABLE_TARGETS.find(
                (t) => t.id === target.targetId
              );
              if (!targetConfig) return null;

              const Icon = targetConfig.icon;
              const error = getTargetError(index);

              return (
                <div
                  key={`${target.targetId}-${index}`}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {targetConfig.name} Output Path
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Input
                      placeholder={`e.g. ./components/icons${targetConfig.extension[0]} or ./components/icons/{name}${targetConfig.extension[0]}`}
                      value={target.outputPath}
                      onChange={(e) => updateTargetPath(index, e.target.value)}
                      className={cn(error?.outputPath && "border-destructive")}
                    />
                    {error?.outputPath && (
                      <FieldError errors={[error.outputPath]} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {fieldState &&
        typeof fieldState === "object" &&
        "message" in fieldState &&
        !Array.isArray(fieldState) && <FieldError errors={[fieldState]} />}
    </Field>
  );
}
