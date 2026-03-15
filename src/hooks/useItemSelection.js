import { useState } from "react";
import { titleStat } from "../utils/lootLogic";

export function useItemSelection() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileSpecDetail, setMobileSpecDetail] = useState(null);

  const handleSelectItem = (row) => {
    setSelectedItem((current) => (current?.item.id === row.item.id ? null : row));
  };

  const openMobileSpecDetail = (row, item) => {
    const itemStats = item?.stats?.length ? item.stats.map(titleStat).join("/") : "None";

    setMobileSpecDetail({
      specFull: row.spec.full,
      specColor: row.spec.color,
      priority: row.spec.priority,
      itemStats,
      reason: row.result.reason,
      tier: row.result.tier,
      rank: row.result.rank,
    });
  };

  const closeMobileSpecDetail = () => setMobileSpecDetail(null);

  return {
    selectedItem,
    mobileSpecDetail,
    handleSelectItem,
    openMobileSpecDetail,
    closeMobileSpecDetail,
  };
}
