import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@iconoma/ui/components/button";
import { useIcon } from "../../../../hooks/icons";
import { SvgEditor } from "../../../../components/svg-editor";
import { SvgPreview } from "../../../../components/svg-preview";
import { IconFormModal } from "../../../../components/icon-form-modal";

export default function EditIcon() {
  const { iconKey } = useParams<{ iconKey: string }>();
  const navigate = useNavigate();
  const { data: iconData, isPending, error } = useIcon(iconKey || "");
  const [svgContent, setSvgContent] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (iconData) {
      setSvgContent(iconData.svgContent);
    }
  }, [iconData]);

  const initialFormData = useMemo(() => {
    if (!iconData) return undefined;
    return {
      name: iconData.icon.name,
      tags: iconData.icon.tags,
      svgContent: iconData.svgContent,
      colorVariableKeys: iconData.icon.colorVariableKeys || [],
    };
  }, [iconData]);

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

  const handleIconUpdated = (iconKey: string) => {
    navigate(`/icons/${iconKey}/preview`);
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
                Your SVG preview
              </p>
              <p className="text-sm text-muted-foreground">
                Edit the SVG content and update the icon properties. The name
                cannot be changed.
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
          Update Icon
        </Button>
      </div>

      <IconFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        svgContent={svgContent}
        onSuccess={handleIconUpdated}
        mode="edit"
        initialData={initialFormData}
      />
    </div>
  );
}
