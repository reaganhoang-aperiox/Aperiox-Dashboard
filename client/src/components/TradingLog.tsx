import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchDeals, type Deal } from "@/services/api";
import { authService } from "@/services/auth";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

const TradingLog = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    const loadDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDeals(undefined, undefined, selectedYear);
        // fetchDeals now returns an array directly
        setDeals(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch trading log"
        );
        console.error("Error fetching deals:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, [selectedYear]);

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

  // Filter deals based on type
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (filterType === "all") return true;
      if (filterType === "closed") {
        return (
          deal.entryType === "DEAL_ENTRY_OUT" &&
          deal.type !== "DEAL_TYPE_BALANCE"
        );
      }
      if (filterType === "balance") {
        return deal.type === "DEAL_TYPE_BALANCE";
      }
      if (filterType === "profit") {
        return deal.profit > 0 && deal.entryType === "DEAL_ENTRY_OUT";
      }
      if (filterType === "loss") {
        return deal.profit < 0 && deal.entryType === "DEAL_ENTRY_OUT";
      }
      return true;
    });
  }, [deals, filterType]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredDeals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDeals = filteredDeals.slice(startIndex, endIndex);

  // Reset to page 1 when filter or year changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, selectedYear]);

  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

  // Calculate statistics
  const closedTrades = deals.filter(
    (d) => d.entryType === "DEAL_ENTRY_OUT" && d.type !== "DEAL_TYPE_BALANCE"
  );
  const totalProfit = closedTrades.reduce(
    (sum, d) => sum + d.profit + d.commission + d.swap,
    0
  );
  const wonTrades = closedTrades.filter((d) => d.profit > 0);
  const lostTrades = closedTrades.filter((d) => d.profit < 0);

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
          <div className="text-brand-gray">Loading trading log...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4 md:px-10 bg-brand-light-alt/40 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2 text-destructive">
            Error Loading Trading Log
          </div>
          <div className="text-brand-gray">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-10 bg-brand-light-alt/40">
      <div className="mx-auto space-y-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Trading Log</h1>
          <p className="text-brand-gray mt-1">
            Complete history of all trading activities
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-brand-gray">
                Total Trades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{closedTrades.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-brand-gray">
                Won / Lost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-light">
                <span>{wonTrades.length}</span>
                {" / "}
                <span>{lostTrades.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-brand-gray">
                Net Profit/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${
                  totalProfit >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {totalProfit >= 0 ? "+" : ""}
                {formatCurrency(totalProfit)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-brand-gray">
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {closedTrades.length > 0
                  ? ((wonTrades.length / closedTrades.length) * 100).toFixed(1)
                  : "0"}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div>
                <CardTitle>Trade History</CardTitle>
                <p className="text-sm text-brand-gray mt-1">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredDeals.length)} of{" "}
                  {filteredDeals.length} deals
                  {filteredDeals.length !== deals.length &&
                    ` (${deals.length} total)`}
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-brand-gray" />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Trades</SelectItem>
                      <SelectItem value="closed">Closed Trades</SelectItem>
                      <SelectItem value="balance">Balance Changes</SelectItem>
                      <SelectItem value="profit">Profitable</SelectItem>
                      <SelectItem value="loss">Losses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand-gray" />
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray">
                      Time
                    </th>
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
                      Price
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-brand-gray">
                      Profit/Loss
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-brand-gray">
                      Commission
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-brand-gray">
                      Swap
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDeals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-20 text-center text-brand-gray"
                      >
                        No trades found for the selected filters
                      </td>
                    </tr>
                  ) : (
                    paginatedDeals.map((deal) => {
                      const isBuy =
                        deal.type === "DEAL_TYPE_BUY" ||
                        deal.type?.includes("BUY");
                      const isBalance = deal.type === "DEAL_TYPE_BALANCE";
                      const profit = deal.profit || 0;
                      const isProfit = profit >= 0;

                      return (
                        <tr
                          key={deal.id}
                          className="border-b border-border/50 hover:bg-card/50 transition-colors"
                        >
                          <td className="py-4 px-4 text-brand-gray text-sm">
                            {formatDate(deal.time)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold">
                              {deal.symbol || "N/A"}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {isBalance ? (
                              <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-brand-light/20 text-brand-light">
                                BALANCE
                              </div>
                            ) : (
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
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            {deal.volume?.toFixed(2) || "0.00"}
                          </td>
                          <td className="py-4 px-4 text-right">
                            {deal.price?.toFixed(5) || "0.00000"}
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
                            {formatCurrency(deal.commission || 0)}
                          </td>
                          <td className="py-4 px-4 text-right text-brand-gray">
                            {formatCurrency(deal.swap || 0)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                <div className="text-sm text-brand-gray">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="min-w-[2.5rem]"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TradingLog;
