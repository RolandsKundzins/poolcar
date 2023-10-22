import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Here are the pages that we are creating</h1>
      <ul>
        <li>
          <Link to="/login">login</Link>;
        </li>
        <li>
          <Link to="/signup">signup</Link>;
        </li>
        <li>
          <Link to="/navigate">navigate</Link>;
        </li>
      </ul>
    </div>
  );
}
