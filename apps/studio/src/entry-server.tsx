import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./app.tsx";

export function render(url: string) {
  const html = renderToString(
    <StrictMode>
      <App url={url} />
    </StrictMode>
  );

  return { html };
}
