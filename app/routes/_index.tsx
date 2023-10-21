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
      <h1>Welcome to Remix</h1>
      <h2>Pagaidām pievienoju šādi linkus  uz visām lapām, lai var visas lapas apskatīties</h2>
      <h3>Drošvien, ka ka pirmajai lapai vajadzēs būt signin/login, nevis šajai.</h3>
      <ul>
        <li>
          <Link to="/login">Login</Link>;
        </li>
        <li>
          <Link to="/signin">Signin</Link>;
        </li>
        <li>
          <Link to="/navigate">Navigate</Link>;
        </li>
      </ul>
    </div>
  );
}
