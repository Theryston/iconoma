import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      {
        find: /^@iconoma\/ui\/components\/(.+)$/,
        replacement: path.resolve(__dirname, "../ui/src/components/$1"),
      },
      {
        find: /^@iconoma\/ui\/lib\/(.+)$/,
        replacement: path.resolve(__dirname, "../ui/src/lib/$1"),
      },
      {
        find: /^@iconoma\/ui\/hooks\/(.+)$/,
        replacement: path.resolve(__dirname, "../ui/src/hooks/$1"),
      },
      {
        find: "@iconoma/ui/globals.css",
        replacement: path.resolve(__dirname, "../ui/src/styles/globals.css"),
      },
      {
        find: "@iconoma/ui",
        replacement: path.resolve(__dirname, "../ui/src"),
      },
    ],
  },
});
