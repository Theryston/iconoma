import { Link } from "react-router";
import { usePwd } from "../hooks/general";
import { GithubIcon } from "lucide-react";

export function Footer() {
  const { data } = usePwd();

  return (
    <footer className="flex items-center justify-center flex-col gap-2 py-4 w-full border-t">
      <p className="text-sm text-muted-foreground">
        Iconoma Studio is working on {data?.pwd}
      </p>

      <div className="flex items-center justify-center gap-4">
        <Link
          to="https://iconoma.org"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
        >
          <img src="/icon.png" alt="Iconoma Logo" className="w-6 h-6" />
        </Link>

        <Link
          to="https://github.com/theryston/iconoma"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity w-6 h-6 p-1 bg-primary rounded-full text-primary-foreground"
        >
          <GithubIcon className="w-full h-full" />
        </Link>
      </div>
    </footer>
  );
}
