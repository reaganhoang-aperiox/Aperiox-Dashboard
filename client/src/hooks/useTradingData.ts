import { useState, useEffect } from "react";
import { fetchTradingData, type WebhookResponse } from "@/services/api";
import { authService } from "@/services/auth";

export const useTradingData = (year?: number) => {
  const [data, setData] = useState<WebhookResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if not authenticated
    if (!authService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchTradingData(year);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        console.error("Error fetching trading data:", err);

        // If authentication error, clear data
        if (err instanceof Error && err.message.includes("Session expired")) {
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Auto-refresh every 30 seconds (more frequent for live trading)
    const interval = setInterval(loadData, 30 * 1000);

    return () => clearInterval(interval);
  }, [year]);

  return { data, loading, error };
};
