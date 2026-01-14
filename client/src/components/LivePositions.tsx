import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPositions, type Position } from "@/services/api";
import { authService } from "@/services/auth";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

const LivePositions = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    const loadPositions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPositions();
        setPositions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch positions"
        );
        console.error("Error fetching positions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPositions();

    // Auto-refresh every minute for live positions
    const interval = setInterval(loadPositions, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 md:px-10 bg-brand-light-alt/40 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <img
              src="/favicon.png"
              alt="Logo"
              className="h-32 w-auto animate-pulse"
            />
          </div>
          <div className="text-brand-gray">Loading positions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4 md:px-10 bg-brand-light-alt/40 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2 text-destructive">
            Error Loading Positions
          </div>
          <div className="text-brand-gray">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-10 bg-brand-light-alt/40">
      <div className="mx-auto space-y-6 ">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Live Positions</h1>
          <p className="text-brand-gray mt-1">
            Real-time open trading positions
          </p>
        </div>

        {positions.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <div className="text-brand-gray text-lg">
                No open positions at the moment
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-brand-gray">
                    Total Positions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{positions.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-brand-gray">
                    Total Profit/Loss
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-3xl font-bold ${
                      positions.reduce((sum, p) => sum + (p.profit || 0), 0) >=
                      0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {formatCurrency(
                      positions.reduce((sum, p) => sum + (p.profit || 0), 0)
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-brand-gray">
                    Total Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {positions
                      .reduce((sum, p) => sum + (p.volume || 0), 0)
                      .toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-brand-gray">
                    Total Commission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatCurrency(
                      positions.reduce((sum, p) => sum + (p.commission || 0), 0)
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Positions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Open Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray">
                          Symbol
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray">
                          Type
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-brand-gray">
                          Volume
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-brand-gray">
                          Open Price
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-brand-gray">
                          Current Price
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-brand-gray">
                          Profit/Loss
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-brand-gray">
                          Commission
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray">
                          Open Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((position) => {
                        const isBuy =
                          position.type === "DEAL_TYPE_BUY" ||
                          position.type?.includes("BUY");
                        const profit = position.profit || 0;
                        const isProfit = profit >= 0;

                        return (
                          <tr
                            key={position.id}
                            className="border-b border-border/50 hover:bg-card/50 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="font-semibold">
                                {position.symbol}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                  isBuy
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {isBuy ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                {isBuy ? "BUY" : "SELL"}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right font-medium">
                              {position.volume?.toFixed(2) || "0.00"}
                            </td>
                            <td className="py-4 px-4 text-right">
                              {position.openPrice?.toFixed(5) || "0.00000"}
                            </td>
                            <td className="py-4 px-4 text-right">
                              {position.openPrice?.toFixed(5) || "0.00000"}
                            </td>
                            <td
                              className={`py-4 px-4 text-right font-semibold ${
                                isProfit ? "text-green-500" : "text-red-500"
                              }`}
                            >
                              {isProfit ? "+" : ""}
                              {formatCurrency(profit)}
                            </td>
                            <td className="py-4 px-4 text-right text-brand-gray">
                              {formatCurrency(position.commission || 0)}
                            </td>
                            <td className="py-4 px-4 text-brand-gray text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(position.time)}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default LivePositions;
