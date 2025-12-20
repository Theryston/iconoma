import { Button } from "@iconoma/ui/components/button";
import { CommitButton } from "./commit-button";
import { PlusIcon } from "lucide-react";
import { ConfigButton } from "./config-button";
import { Link } from "react-router";
import { ColorPicker } from "./color-picker";

export function Header() {
  return (
    <>
      <div className="h-16" />
      <header className="flex items-center justify-between p-4 w-full border-b fixed top-0 left-0 right-0 z-50 h-16 bg-background shadow-sm">
        <Link
          to="/"
          className="hover:opacity-80 transition-opacity flex items-center gap-2 w-full"
        >
          <img src="/icon.png" alt="Iconoma Logo" className="w-6 h-6" />
          <span className="text-sm font-medium">Iconoma Studio</span>
        </Link>

        <div className="flex items-center gap-2">
          <ColorPicker />
          <ConfigButton />
          <Button size="icon" asChild>
            <Link to="/icons/create">
              <PlusIcon />
            </Link>
          </Button>
          <CommitButton />
        </div>
      </header>
    </>
  );
}
