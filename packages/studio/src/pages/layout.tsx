import { Outlet } from "react-router";
import { Footer } from "../components/footer";
import { Header } from "../components/header/index";
import { useWindowWidth } from "../hooks/window";
import { Link } from "react-router";

export default function Layout() {
  const width = useWindowWidth();

  if (width < 768) {
    return (
      <div className="flex justify-center items-center flex-col gap-4 h-screen w-screen p-4">
        <img src="/icon.png" alt="Iconoma Logo" className="w-10 h-10" />
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-2xl font-bold">Mobile version coming soon</h1>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            I know that I'm is an amazing tool, but can you believe the
            developers haven't made a mobile version yet??😤😤😤
            <br />
            You can complain to them{" "}
            <Link
              to="https://github.com/theryston/iconoma/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
