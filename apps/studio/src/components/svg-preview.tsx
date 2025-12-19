import { useStudio } from "../context";

export function SvgPreview({
  content,
  className,
  style,
}: {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { previewColor } = useStudio();

  return (
    <div
      className={className}
      style={{ color: previewColor, ...style }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
