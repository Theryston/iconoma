import * as Icons from "../components/icons";

export default function Home() {
  return (
    <main>
      <div>Hello world!</div>

      {Object.entries(Icons).map(([key, Icon]) => (
        <div key={key}>
          <Icon />
        </div>
      ))}
    </main>
  );
}
