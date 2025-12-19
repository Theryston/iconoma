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
import { useCreateIcon } from "../../../hooks/icons";
import { toast } from "@iconoma/ui/components/sonner";
import { Controller } from "react-hook-form";
import { SvgPreview } from "../../../components/svg-preview";
import { useNavigate } from "react-router";
import type { LockFileIcon } from "../../../../api/types";

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
      onSuccess(result.icon.name);
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
