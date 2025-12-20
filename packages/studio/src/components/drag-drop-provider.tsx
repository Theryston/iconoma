import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router";
import { toast } from "@iconoma/ui/components/sonner";

export function DragDropProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        const fileExtension = file.name.split(".").pop();
        if (fileExtension !== "svg") {
          toast.error(
            `Are you trying to create an icon using a ${fileExtension?.toUpperCase() || "unknown"} file?`,
            {
              description: "OMG, use an SVG file instead.",
              icon: "🤦‍♂️",
            }
          );
          return;
        }

        const fileContent = await file.text();
        const fileName = file.name.replace(/\.svg$/i, "");

        if (
          !fileContent.trim().startsWith("<svg") &&
          !fileContent.includes("<svg")
        ) {
          toast.error("Man, what are you doing? That's not an SVG file.", {
            description: "OMG, use an SVG file instead.",
            icon: "🤦‍♂️",
          });
          return;
        }

        const encodedContent = encodeURIComponent(fileContent);
        navigate(
          `/icons/create?content=${encodedContent}&name=${encodeURIComponent(fileName)}`
        );
      } catch (error) {
        toast.error("Failed to read SVG file. Please try again.");
        console.error("Error reading file:", error);
      }
    },
    [navigate]
  );

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="relative"
      style={{ minHeight: "100vh" }}
    >
      {children}
      {isDragActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm border-4 border-dashed border-primary">
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">
              Drop SVG file here
            </div>
            <div className="text-muted-foreground">
              Release to load the file and create a new icon
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
