import { useEffect, useRef } from "react";
import { useTheme } from "./theme-provider";
import {
  SandpackCodeEditor,
  SandpackProvider,
  useActiveCode,
} from "@iconoma/ui/components/sandpack";

function EditorContent({
  onChange,
  initialValue,
}: {
  onChange: (value: string) => void;
  initialValue: string;
}) {
  const { code } = useActiveCode();
  const lastSentValueRef = useRef<string | null>(null);
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    if (initialValue.length > 0) {
      initialValueRef.current = initialValue;
    }
  }, [initialValue]);

  useEffect(() => {
    const hasInitialValue = initialValueRef.current.length > 0;
    const isEmptyAndHasInitial = code.length === 0 && hasInitialValue;
    const isDuplicate = code === lastSentValueRef.current;

    if (!isEmptyAndHasInitial && !isDuplicate) {
      lastSentValueRef.current = code;
      onChange(code);
    }
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
  const initializedRef = useRef(false);

  if (value.length > 0 && !initializedRef.current) {
    initializedRef.current = true;
  }

  const sandpackKey = initializedRef.current ? "initialized" : "empty";

  return (
    <div className="h-full w-full overflow-hidden">
      <SandpackProvider
        key={sandpackKey}
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
        <EditorContent onChange={onChange} initialValue={value} />
      </SandpackProvider>
    </div>
  );
}
