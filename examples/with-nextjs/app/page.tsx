import { FC } from "react";
import * as Icons from "../components/icons";

const Page: FC = () => {
  return (
    <main className="flex flex-col gap-8 h-screen items-center justify-center">
      <p className="text-center max-w-2xl text-gray-500">
        Look how these icons perfectly respect the text color, text size, color
        variables, etc:
      </p>

      <div className="flex flex-wrap gap-4">
        {Object.entries(Icons).map(([key, Icon]) => (
          <div
            key={key}
            className="text-blue-300 text-4xl flex flex-col items-center gap-2"
            style={{ "--icons-secondary": "#cdb3ff" } as React.CSSProperties}
          >
            <Icon />
            <span className="text-sm">{key}</span>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Page;
