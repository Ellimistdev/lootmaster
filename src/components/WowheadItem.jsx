import { useEffect } from "react";
const SCRIPT_ID = "wowhead-tooltips-script";
export default function WowheadItem({ itemId }) {
  useEffect(() => {
    window.whTooltips = { colorLinks: true, iconizeLinks: true, renameLinks: true };
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://wow.zamimg.com/js/tooltips.js";
      script.async = true;
      document.head.appendChild(script);
    } else {
      window.$WowheadPower?.refreshLinks?.();
    }
  }, []);
  useEffect(() => { window.$WowheadPower?.refreshLinks?.(); }, [itemId]);
  return <a data-wowhead={`item=${itemId}`} className="text-sky-400 hover:underline"
    href={`https://www.wowhead.com/item=${itemId}`} target="_blank" rel="noreferrer">Item {itemId}</a>;
}
