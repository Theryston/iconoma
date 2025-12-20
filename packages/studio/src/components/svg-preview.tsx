import { useStudio } from "../context";
import { useConfig } from "../hooks/config";
import { useMemo } from "react";

export function SvgPreview({
  content,
  className,
  style,
}: {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { previewColor, colorVariableValues } = useStudio();
  const { data: config } = useConfig();
  const colorVariables = config?.colorVariables || [];

  const styleWithVariables = useMemo(() => {
    const cssVars: Record<string, string> = {
      color: previewColor,
    };

    colorVariables.forEach((variable: string) => {
      const colorValue = colorVariableValues[variable] || "#e5e5e5";
      cssVars[variable] = colorValue;
    });

    return cssVars;
  }, [previewColor, colorVariableValues, colorVariables]);

  return (
    <div
      className={className}
      style={{ ...styleWithVariables, ...style }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
