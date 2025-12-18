import { ThemeProvider } from "./components/theme-provider";
import { BrowserRouter, Routes, Route, StaticRouter } from "react-router";
import "@iconoma/ui/globals.css";
import Home from "./pages";
import CreateIcon from "./pages/icons/create";
import Layout from "./pages/layout";

type AppProps = {
  url?: string;
};

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

export default function App({ url }: AppProps = {}) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="iconoma-studio-theme">
      <Router url={url}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/icons/create" element={<CreateIcon />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
