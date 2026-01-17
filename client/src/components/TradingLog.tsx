import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
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
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 10;

const TradingLog = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Date picker for range filter
  const [selectedDate, setSelectedDate] = useState<{ from?: Date; to?: Date }>(
    {},
  );
  // Local state for calendar visible months
  const [startMonth, setStartMonth] = useState<Date | undefined>(undefined);
  const [endMonth, setEndMonth] = useState<Date | undefined>(undefined);
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom] = useState<string>("");
  const [dateTo] = useState<string>("");
  const [search] = useState<string>("");

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    const loadDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        // If selectedDate is set, filter by range
        let from: number | undefined = undefined;
        let to: number | undefined = undefined;
        if (
          selectedDate?.from instanceof Date &&
          !isNaN(selectedDate.from.getTime())
        ) {
          from = selectedDate.from.setHours(0, 0, 0, 0);
        }
        if (
          selectedDate?.to instanceof Date &&
          !isNaN(selectedDate.to.getTime())
        ) {
          to = selectedDate.to.setHours(23, 59, 59, 999);
        }
        const data = await fetchDeals(from, to);
        setDeals(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch trading log",
        );
        console.error("Error fetching deals:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, [selectedDate]);

  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  // Filter deals based on type, date range, and search input
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      // Date filter only applies to profit/loss
      let dateMatch = true;
      if (
        (filterType === "profit" || filterType === "loss") &&
        (dateFrom || dateTo)
      ) {
        const dealDate = new Date(deal.time);
        if (dateFrom) {
          const from = new Date(dateFrom);
          from.setHours(0, 0, 0, 0);
          if (dealDate < from) dateMatch = false;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          if (dealDate > to) dateMatch = false;
        }
      }
      if (!dateMatch) return false;
      if (filterType === "all") {
        // General search for all trades
        if (search) {
          const s = search.toLowerCase();
          // Search in symbol, price, volume, profit, commission, swap, and formatted date
          if (
            !(
              deal.symbol?.toLowerCase().includes(s) ||
              (deal.price && deal.price.toString().includes(s)) ||
              (deal.volume && deal.volume.toString().includes(s)) ||
              (deal.profit && deal.profit.toString().includes(s)) ||
              (deal.commission && deal.commission.toString().includes(s)) ||
              (deal.swap && deal.swap.toString().includes(s)) ||
              formatDate(deal.time).toLowerCase().includes(s)
            )
          ) {
            return false;
          }
        }
        return true;
      }
      if (filterType === "closed") {
        if (
          !(
            deal.entryType === "DEAL_ENTRY_OUT" &&
            deal.type !== "DEAL_TYPE_BALANCE"
          )
        ) {
          return false;
        }
        if (search) {
          const s = search.toLowerCase();
          if (
            !(
              deal.symbol?.toLowerCase().includes(s) ||
              (deal.price && deal.price.toString().includes(s)) ||
              (deal.volume && deal.volume.toString().includes(s)) ||
              (deal.profit && deal.profit.toString().includes(s)) ||
              (deal.commission && deal.commission.toString().includes(s)) ||
              (deal.swap && deal.swap.toString().includes(s)) ||
              formatDate(deal.time).toLowerCase().includes(s)
            )
          ) {
            return false;
          }
        }
        return true;
      }
      if (filterType === "balance") {
        if (deal.type !== "DEAL_TYPE_BALANCE") return false;
        if (search) {
          const s = search.toLowerCase();
          if (
            !(
              deal.symbol?.toLowerCase().includes(s) ||
              (deal.price && deal.price.toString().includes(s)) ||
              (deal.volume && deal.volume.toString().includes(s)) ||
              (deal.profit && deal.profit.toString().includes(s)) ||
              (deal.commission && deal.commission.toString().includes(s)) ||
              (deal.swap && deal.swap.toString().includes(s)) ||
              formatDate(deal.time).toLowerCase().includes(s)
            )
          ) {
            return false;
          }
        }
        return true;
      }
      if (filterType === "profit") {
        if (!(deal.profit > 0 && deal.entryType === "DEAL_ENTRY_OUT"))
          return false;
        if (search) {
          const s = search.toLowerCase();
          if (
            !(
              deal.symbol?.toLowerCase().includes(s) ||
              (deal.price && deal.price.toString().includes(s)) ||
              (deal.volume && deal.volume.toString().includes(s)) ||
              (deal.profit && deal.profit.toString().includes(s)) ||
              (deal.commission && deal.commission.toString().includes(s)) ||
              (deal.swap && deal.swap.toString().includes(s)) ||
              formatDate(deal.time).toLowerCase().includes(s)
            )
          ) {
            return false;
          }
        }
        return true;
      }
      if (filterType === "loss") {
        if (!(deal.profit < 0 && deal.entryType === "DEAL_ENTRY_OUT"))
          return false;
        if (search) {
          const s = search.toLowerCase();
          if (
            !(
              deal.symbol?.toLowerCase().includes(s) ||
              (deal.price && deal.price.toString().includes(s)) ||
              (deal.volume && deal.volume.toString().includes(s)) ||
              (deal.profit && deal.profit.toString().includes(s)) ||
              (deal.commission && deal.commission.toString().includes(s)) ||
              (deal.swap && deal.swap.toString().includes(s)) ||
              formatDate(deal.time).toLowerCase().includes(s)
            )
          ) {
            return false;
          }
        }
        return true;
      }
      return true;
    });
  }, [deals, filterType, dateFrom, dateTo, search]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredDeals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDeals = filteredDeals.slice(startIndex, endIndex);

  // Reset to page 1 when filter or date changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, selectedDate]);

  // Remove year options, use date picker

  // Calculate statistics
  const closedTrades = deals.filter(
    (d) => d.entryType === "DEAL_ENTRY_OUT" && d.type !== "DEAL_TYPE_BALANCE",
  );
  const totalProfit = closedTrades.reduce(
    (sum, d) => sum + d.profit + d.commission + d.swap,
    0,
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
              <div className="w-full">
                <CardTitle>Trade History</CardTitle>
                <p className="text-sm text-brand-gray mt-1">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredDeals.length)} of{" "}
                  {filteredDeals.length} deals
                  {filteredDeals.length !== deals.length &&
                    ` (${deals.length} total)`}
                </p>
              </div>
              <div className="flex gap-3 justify-end items-center flex-wrap w-full">
                {/* Date range search for profit/loss only using shadcn calendar popover */}

                {/* Date picker for year/month filter */}
                <div className="flex items-center gap-2">
                  {/* Start Date Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={
                          "w-[160px] justify-start text-left font-normal"
                        }
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-brand-gray" />
                        {selectedDate?.from
                          ? format(selectedDate.from, "MMM d, yyyy")
                          : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0 w-fit">
                      <Calendar
                        mode="single"
                        selected={selectedDate?.from}
                        month={startMonth || selectedDate?.from || undefined}
                        onMonthChange={setStartMonth}
                        onSelect={(date) => {
                          setSelectedDate((prev) => ({ ...prev, from: date }));
                          if (date) setStartMonth(date);
                        }}
                        captionLayout="dropdown"
                        fromYear={new Date().getFullYear() - 10}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                  {/* End Date Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={
                          "w-[160px] justify-start text-left font-normal"
                        }
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-brand-gray" />
                        {selectedDate?.to
                          ? format(selectedDate.to, "MMM d, yyyy")
                          : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0 w-fit">
                      <Calendar
                        mode="single"
                        selected={selectedDate?.to}
                        month={endMonth || selectedDate?.to || undefined}
                        onMonthChange={setEndMonth}
                        onSelect={(date) => {
                          setSelectedDate((prev) => ({ ...prev, to: date }));
                          if (date) setEndMonth(date);
                        }}
                        captionLayout="dropdown"
                        fromYear={new Date().getFullYear() - 10}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

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
