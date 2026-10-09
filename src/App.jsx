import LootTablePage from "./pages/LootTablePage";
import SimcPage from "./pages/SimcPage";

const SIMC_HOST = "simc.elli.gg";
const LOOT_HOST = "lootmaster.elli.gg";

export default function App() {
  const isSimc = window.location.hostname.toLowerCase() === SIMC_HOST;
  const links = [
    { href: `https://${LOOT_HOST}/`, label: "Loot Table", active: !isSimc },
    { href: `https://${SIMC_HOST}/`, label: "SimC Analyzer", active: isSimc },
  ];
  return (
    <>
      <nav aria-label="Main navigation" className="border-b border-zinc-800 bg-zinc-950 px-6 py-3 text-zinc-100">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-6">
          <a className="font-bold text-sky-400" href={`https://${LOOT_HOST}/`}>Lootmaster</a>
          {links.map(({ href, label, active }) => (
            <a key={href} href={href} aria-current={active ? "page" : undefined}
              className={active ? "font-semibold text-sky-400" : "text-zinc-300 hover:text-white"}>{label}</a>
          ))}
        </div>
      </nav>
      {isSimc ? <SimcPage /> : <LootTablePage />}
    </>
  );
}
