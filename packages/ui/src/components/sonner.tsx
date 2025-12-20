"use client";

import React, { useEffect, useState } from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
export { toast } from "sonner";

function useThemeSafe() {
  const [theme, setTheme] = useState<ToasterProps["theme"]>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const detectTheme = (): ToasterProps["theme"] => {
      if (typeof window === "undefined") return "system";

      const root = document.documentElement;
      const isDark = root.classList.contains("dark");
      const isLight = root.classList.contains("light");

      if (isDark) return "dark";
      if (isLight) return "light";

      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      return prefersDark ? "dark" : "light";
    };

    setTheme(detectTheme());

    const observer = new MutationObserver(() => {
      setTheme(detectTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setTheme(detectTheme());
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return { theme, mounted };
}

function ClientOnlyToaster({ ...props }: ToasterProps) {
  const { theme, mounted } = useThemeSafe();

  const finalTheme = mounted ? theme : "system";

  return (
    <Sonner
      theme={finalTheme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      }
      {...props}
    />
  );
}

const Toaster = ({ ...props }: ToasterProps) => {
  if (typeof window === "undefined") return null;

  return <ClientOnlyToaster {...props} />;
};

export { Toaster };
