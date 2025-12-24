import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@iconoma/ui/components/dialog";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { configFormSchema, type ConfigInput, type Config } from "./schema";
import { useConfig } from "../../hooks/config";
import { toast } from "@iconoma/ui/components/sonner";
import { ConfigFormStep } from "./steps/config-form-step";
import { ConfigChangesStep } from "./steps/config-changes-step";
import type { Change } from "../../../api/types";

export function isDynamicPath(path: string): boolean {
  return path.includes("{name}");
}

export function getPathExtension(path: string): string {
  if (isDynamicPath(path)) {
    const match = path.match(/\{name\}(.+)$/);
    return match?.[1] ? match[1] : "";
  }

  const lastDot = path.lastIndexOf(".");
  return lastDot !== -1 ? path.slice(lastDot) : "";
}

export function validateOutputPath(
  path: string,
  expectedExtensions: string[]
): boolean {
  if (!path) return false;
  const extension = getPathExtension(path);
  return expectedExtensions.includes(extension);
}

export function ConfigModal({
  open,
  onOpenChange: onOpenChangeProp,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: config, isPending: isLoadingConfig } = useConfig();
  const [step, setStep] = useState<1 | 2>(1);
  const [pendingChanges, setPendingChanges] = useState<Change[] | null>(null);
  const [pendingConfig, setPendingConfig] = useState<Config | null>(null);

  const form = useForm<ConfigInput>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      svg: {
        folder: undefined,
        inLock: false,
      },
      svgo: JSON.stringify(
        {
          plugins: [
            "removeDimensions",
            "removeHiddenElems",
            "removeTitle",
            {
              name: "convertColors",
              params: {
                currentColor: false,
                names2hex: true,
              },
            },
          ],
        },
        null,
        2
      ),
      extraTargets: [],
      colorVariables: [],
      componentNameFormat: undefined,
    },
  });

  const isOnboarding = useMemo(() => {
    return !config && !isLoadingConfig;
  }, [config, isLoadingConfig]);

  const handleNextStep = useCallback((changes: Change[], config: Config) => {
    setPendingChanges(changes);
    setPendingConfig(config);
    setStep(2);
  }, []);

  const handleBack = useCallback(() => {
    setStep(1);
    setPendingChanges(null);
    setPendingConfig(null);
  }, []);

  const resetForm = useCallback(
    (newConfig?: Config) => {
      const configToUse = newConfig ?? config;

      setStep(1);
      setPendingChanges(null);
      setPendingConfig(null);
      form.reset({
        ...configToUse,
        svgo: JSON.stringify(configToUse.svgo, null, 2),
      });
    },
    [form, config]
  );

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (isLoadingConfig) return;

      if (isOnboarding && !open) {
        toast.error("OMG! Why are you trying to close the onboarding?", {
          icon: "😒",
        });
        return;
      }

      if (!open) {
        resetForm();
      }

      onOpenChangeProp(open);
    },
    [isOnboarding, isLoadingConfig, onOpenChangeProp]
  );

  useEffect(() => {
    if (isLoadingConfig) return;

    if (isOnboarding) {
      onOpenChange(true);
    } else {
      resetForm(config);
    }
  }, [isOnboarding, config, form, isLoadingConfig, onOpenChange]);

  const stepTitle =
    step === 1 ? (isOnboarding ? "Onboarding" : "Config") : "Review Changes";

  const stepDescription =
    step === 1
      ? isOnboarding
        ? "Let's get you started with Iconoma."
        : "Configure the Iconoma project."
      : "Review the changes that will be applied to your project. If you confirm, these changes will be executed.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{stepTitle}</DialogTitle>
          <DialogDescription>{stepDescription}</DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <ConfigFormStep
            form={form}
            onNextStep={handleNextStep}
            onComplete={() => {
              onOpenChangeProp(false);
              resetForm();
            }}
          />
        ) : (
          pendingChanges &&
          pendingConfig && (
            <ConfigChangesStep
              changes={pendingChanges}
              config={pendingConfig}
              onConfirm={() => {
                onOpenChangeProp(false);
              }}
              onBack={handleBack}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
