import { useState, useEffect, useMemo } from "react";
import { Button } from "@iconoma/ui/components/button";
import { SvgPreview } from "../../../components/svg-preview";
import { SvgEditor } from "../../../components/svg-editor";
import { IconFormModal } from "../../../components/icon-form-modal";
import { useNavigate, useSearchParams } from "react-router";

export default function CreateIcon() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [svgContent, setSvgContent] = useState(
    '<svg width="700" height="700" viewBox="0 0 700 700" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M150 250H155H350H550H685C642.5 105 507.5 0 350 0C192.5 0 57.5 105 15 250H150Z" fill="#E5E5E5"/>\n<path d="M575 300V350C575 392.5 542.5 425 500 425H435C402.5 425 375 405 365 372.5L350 340L335 375C325 405 297.5 425 265 425H200C157.5 425 125 392.5 125 350V300H5C2.5 317.5 0 332.5 0 350C0 542.5 157.5 700 350 700C542.5 700 700 542.5 700 350C700 332.5 697.5 317.5 695 300H575ZM497.5 495C457.5 530 405 550 350 550C335 550 325 540 325 525C325 510 335 500 350 500C392.5 500 432.5 485 465 455C475 445 490 447.5 500 457.5C510 470 510 485 497.5 495Z" fill="#E5E5E5"/>\n</svg>'
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [initialName, setInitialName] = useState<string | undefined>(undefined);

  useEffect(() => {
    const contentParam = searchParams.get("content");
    const nameParam = searchParams.get("name");

    if (contentParam) {
      try {
        const decodedContent = decodeURIComponent(contentParam);
        setSvgContent(decodedContent);
      } catch (error) {
        console.error("Failed to decode SVG content from URL:", error);
      }
    }

    if (nameParam) {
      try {
        const decodedName = decodeURIComponent(nameParam);
        setInitialName(decodedName);
        setModalOpen(true);
      } catch (error) {
        console.error("Failed to decode name from URL:", error);
      }
    }

    if (contentParam || nameParam) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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

      <IconFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        svgContent={svgContent}
        onSuccess={handleIconCreated}
        mode="create"
        initialName={initialName}
      />
    </div>
  );
}
