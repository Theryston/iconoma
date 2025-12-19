import * as Icons from "../components/icons";

export default function Home() {
  return (
    <main className="flex flex-col gap-4">
      <div>Look how this icons respect the text color, text size, etc:</div>

      <div className="flex flex-wrap gap-4">
        {Object.entries(Icons).map(([key, Icon]) => (
          <div key={key} className="text-blue-500 text-4xl">
            <Icon />
          </div>
        ))}
      </div>
    </main>
  );
}
