import { useEffect } from "react";
import { useTheme } from "./theme-provider";
import {
  SandpackCodeEditor,
  SandpackProvider,
  useActiveCode,
} from "@iconoma/ui/components/sandpack";

function EditorContent({ onChange }: { onChange: (value: string) => void }) {
  const { code } = useActiveCode();

  useEffect(() => {
    onChange(code);
  }, [code, onChange]);

  return <SandpackCodeEditor showInlineErrors style={{ height: "100%" }} />;
}

export function SvgEditor({
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
