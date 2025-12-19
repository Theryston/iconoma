import { useState, useEffect, useMemo, useRef } from "react";
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
import { Slider } from "@iconoma/ui/components/slider";
import { useCreateIcon } from "../../../hooks/icons";
import { useConfig } from "../../../hooks/config";
import { useStudio } from "../../../context";
import { toast } from "@iconoma/ui/components/sonner";
import { Controller } from "react-hook-form";
import { SvgPreview } from "../../../components/svg-preview";
import { ArrowDown } from "lucide-react";
import confetti from "canvas-confetti";
import type { LockFileIcon, ExtraTarget } from "../../../../api/types";
import { useNavigate } from "react-router";

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

function AdvancedPreviewStep({
  icon,
  pascalName,
}: {
  icon: LockFileIcon;
  pascalName: string;
}) {
  const navigate = useNavigate();
  const { data: config } = useConfig();
  const { setColorPickerHint } = useStudio();
  const [size, setSize] = useState([50]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [iconContent, setIconContent] = useState<string>("");
  const confettiTriggered = useRef(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confettiTriggered.current && previewRef.current) {
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
  }, [setColorPickerHint]);

  useEffect(() => {
    const isFile = icon.svg.content.startsWith("file://");
    if (!isFile) {
      setIconContent(icon.svg.content);
    } else {
      async function fetchFileContent() {
        try {
          const filePath = icon.svg.content.replace("file://", "");
          const response = await fetch(
            `/api/icons/content?path=${encodeURIComponent(filePath)}`
          );
          if (response.ok) {
            const content = await response.text();
            setIconContent(content);
          } else {
            setIconContent(icon.svg.content);
          }
        } catch (error) {
          console.error("Failed to load icon content:", error);
          setIconContent(icon.svg.content);
        }
      }
      fetchFileContent();
    }
  }, [icon]);

  const tabs = useMemo(() => {
    const availableTabs: string[] = [];

    if (config?.extraTargets.some((t: ExtraTarget) => t.targetId === "react")) {
      availableTabs.push("react");
    }

    if (config && !config.svg.inLock) {
      availableTabs.push("svg");
    }

    if (
      config?.extraTargets.some(
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

  const getSvgPath = () => {
    if (!config || config.svg.inLock) return "";
    const isFile = icon.svg.content.startsWith("file://");
    if (isFile) {
      return icon.svg.content.replace("file://", "");
    }
    return "";
  };

  const getReactPath = () => {
    if (!config) return "";
    const reactTarget = config.extraTargets.find(
      (t: ExtraTarget) => t.targetId === "react"
    );
    if (!reactTarget) return "";
    return reactTarget.outputPath.replace("{name}", icon.name);
  };

  const getReactNativePath = () => {
    if (!config) return "";
    const rnTarget = config.extraTargets.find(
      (t: ExtraTarget) => t.targetId === "react-native"
    );
    if (!rnTarget) return "";
    return rnTarget.outputPath.replace("{name}", icon.name);
  };

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
                content={iconContent}
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
          Done
        </Button>
      </div>
    </div>
  );
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
  onSuccess: (icon: LockFileIcon, pascalName: string) => void;
}) {
  const createIcon = useCreateIcon();

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

    try {
      const result = await createIcon.mutateAsync({
        name: data.name,
        tags: tagsArray,
        content: data.content,
      });

      toast.success("Icon created successfully!");
      onOpenChange(false);
      form.reset();
      onSuccess(result.icon, result.pascalName);
    } catch (error) {
      toast.error("Failed to create icon. Please try again.");
      console.error("Error creating icon:", error);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Icon</DialogTitle>
          <DialogDescription>
            Enter the icon name and tags to create your icon.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <div className="flex justify-end gap-2">
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
  const { setColorPickerHint } = useStudio();
  const [svgContent, setSvgContent] = useState(
    '<svg width="700" height="700" viewBox="0 0 700 700" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M150 250H155H350H550H685C642.5 105 507.5 0 350 0C192.5 0 57.5 105 15 250H150Z" fill="#E5E5E5"/>\n<path d="M575 300V350C575 392.5 542.5 425 500 425H435C402.5 425 375 405 365 372.5L350 340L335 375C325 405 297.5 425 265 425H200C157.5 425 125 392.5 125 350V300H5C2.5 317.5 0 332.5 0 350C0 542.5 157.5 700 350 700C542.5 700 700 542.5 700 350C700 332.5 697.5 317.5 695 300H575ZM497.5 495C457.5 530 405 550 350 550C335 550 325 540 325 525C325 510 335 500 350 500C392.5 500 432.5 485 465 455C475 445 490 447.5 500 457.5C510 470 510 485 497.5 495Z" fill="#E5E5E5"/>\n</svg>'
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [createdIcon, setCreatedIcon] = useState<{
    icon: LockFileIcon;
    pascalName: string;
  } | null>(null);

  useEffect(() => {
    // Clear hint when on step 1
    if (step === 1) {
      setColorPickerHint(null);
    }
  }, [step, setColorPickerHint]);

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

  const handleIconCreated = (icon: LockFileIcon, pascalName: string) => {
    setCreatedIcon({ icon, pascalName });
    setStep(2);
  };

  if (step === 2 && createdIcon) {
    return (
      <AdvancedPreviewStep
        icon={createdIcon.icon}
        pascalName={createdIcon.pascalName}
      />
    );
  }

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
