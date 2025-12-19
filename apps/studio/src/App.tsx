import { ThemeProvider } from "./components/theme-provider";
import { BrowserRouter, Routes, Route, StaticRouter } from "react-router";
import "@iconoma/ui/globals.css";
import Home from "./pages";
import CreateIcon from "./pages/icons/create";
import Layout from "./pages/layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@iconoma/ui/components/sonner";
import { ActionsButton } from "./components/actions-button";
import { StudioProvider } from "./context";

type AppProps = {
  url?: string;
};

const queryClient = new QueryClient();

export function App({ url }: AppProps = {}) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="iconoma-studio-theme">
      <QueryClientProvider client={queryClient}>
        <StudioProvider>
          <Router url={url}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/icons/create" element={<CreateIcon />} />
              </Route>
            </Routes>
          </Router>

          <ActionsButton />
          {typeof window !== "undefined" && <Toaster />}
        </StudioProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function Router({
  url,
  children,
}: {
  url?: string;
  children: React.ReactNode;
}) {
  if (typeof window === "undefined") {
    return <StaticRouter location={url || "/"}>{children}</StaticRouter>;
  }
  return <BrowserRouter>{children}</BrowserRouter>;
}
