import { useEffect, useState } from "react";
import LootTablePage from "./pages/LootTablePage";
import SimcPage from "./pages/SimcPage";
import DataPage from "./pages/DataPage";

const links = [{ href: "/", label: "Loot Table" }, { href: "/simc", label: "SimC Analyzer" }, { href: "/data", label: "Data" }];

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const navigate = (event, href) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.pushState({}, "", href);
    setPath(href);
    window.scrollTo(0, 0);
  };
  return (
    <>
      <nav aria-label="Main navigation" className="border-b border-zinc-800 bg-zinc-950 px-6 py-3 text-zinc-100">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-6">
          <a className="font-bold text-sky-400" href="/" onClick={(event) => navigate(event, "/")}>Lootmaster</a>
          {links.map(({ href, label }) => (
            <a key={href} href={href} onClick={(event) => navigate(event, href)}
              aria-current={path === href ? "page" : undefined}
              className={path === href ? "font-semibold text-sky-400" : "text-zinc-300 hover:text-white"}>{label}</a>
          ))}
        </div>
      </nav>
      {path === "/simc" ? <SimcPage /> : path === "/data" ? <DataPage /> : path === "/" ? <LootTablePage /> :
        <main className="min-h-screen bg-zinc-950 p-8 text-zinc-100"><h1 className="text-2xl font-bold">Page not found</h1><a href="/" className="text-sky-400">Return to Loot Table</a></main>}
    </>
  );
}
