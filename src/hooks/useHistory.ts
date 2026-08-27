import { useEffect, useState } from "react";

import { getHistoryList } from "@/api/historyApi";
import type { HistoryResponse } from "@/types/history";

export default function useHistory() {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const data = await getHistoryList();
        setHistory(data);
      } catch (error) {
        console.error("히스토리 조회 실패:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return {
    history,
    isLoading,
    isError,
  };
}