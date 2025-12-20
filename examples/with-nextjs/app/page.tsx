import { FC } from "react";
import * as Icons from "../components/icons";

const Page: FC = () => {
  return (
    <main className="flex flex-col gap-4">
      <div>
        Look how these icons perfectly respect the text color, text size, color
        variables, etc:
      </div>

      <div className="flex flex-wrap gap-4">
        {Object.entries(Icons).map(([key, Icon]) => (
          <div
            key={key}
            className="text-blue-500 text-4xl"
            style={{ "--icons-secondary": "#ff9900" } as React.CSSProperties}
          >
            <Icon />
          </div>
        ))}
      </div>
    </main>
  );
};

export default Page;
