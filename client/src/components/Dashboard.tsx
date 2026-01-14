import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartBarDefault } from "@/components/ui/chart-bar-default";
import { ChartWinRate } from "@/components/ui/chart-win-rate";
import { Info, Lock, MoveUpRight, Wallet } from "lucide-react";
import { useState, useMemo } from "react";
import { useTradingData } from "@/hooks/useTradingData";
import { calculateMetrics, calculateDrawdown } from "@/utils/calculateMetrics";

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const totalPages = 1;

  const { data, loading, error } = useTradingData(selectedYear);

  const metrics = useMemo(() => {
    if (!data) return null;

    // Ensure deals is always an array
    const deals = Array.isArray(data.deals) ? data.deals : [];

    // Get initial balance - find the earliest positive balance deal or calculate from all balance deals
    // Sort balance deals by time to find the first one
    const balanceDeals = deals
      .filter((d) => d.type === "DEAL_TYPE_BALANCE")
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    // Calculate initial balance: start with current balance and subtract all balance deal changes
    // OR use the first balance deal if it's positive (deposit)
    let initialBalance = data.balance;
    if (balanceDeals.length > 0) {
      // Reverse calculate: current balance - sum of all balance changes = initial balance
      const totalBalanceChanges = balanceDeals.reduce(
        (sum, d) => sum + d.profit,
        0
      );
      initialBalance = data.balance - totalBalanceChanges;

      // If calculated initial balance is negative or zero, use the first positive balance deal
      if (initialBalance <= 0) {
        const firstPositiveBalance = balanceDeals.find((d) => d.profit > 0);
        if (firstPositiveBalance) {
          initialBalance = firstPositiveBalance.profit;
        }
      }
    }

    // Ensure initial balance is positive
    if (initialBalance <= 0) {
      initialBalance = data.balance;
    }

    const calculated = calculateMetrics(deals, data.balance, initialBalance);
    const drawdown = calculateDrawdown(deals);

    // Calculate monthly profit (last 30 days instead of current month)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const closedTrades = deals.filter(
      (d) => d.entryType === "DEAL_ENTRY_OUT" && d.type !== "DEAL_TYPE_BALANCE"
    );
    const monthlyProfit = closedTrades
      .filter((d) => new Date(d.time) >= thirtyDaysAgo)
      .reduce((sum, d) => sum + d.profit + d.commission + d.swap, 0);

    return { ...calculated, drawdown, monthlyProfit };
  }, [data]);

  const formatCurrency = (value: number) => {
    return `$${Math.round(value).toLocaleString("en-US")}`;
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
          <div className="text-brand-gray">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
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
          <div className="text-xl font-semibold mb-2 text-destructive">
            Error Loading Data
          </div>
          <div className="text-brand-gray">{error}</div>
        </div>
      </div>
    );
  }

  if (!data || !metrics) {
    return (
      <div className="min-h-screen py-8 px-4 md:px-10 bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">No Data Available</div>
          <div className="text-brand-gray">Unable to load trading data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-10 bg-brand-light-alt/40">
      <div className="mx-auto space-y-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Account Metrics</h1>
          <p className="text-brand-gray mt-1">
            {data.account.region} • {data.account.name} • {data.account.server}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2.4fr_2fr] lg:items-start">
          <div className="grid grid-cols-1 gap-6 lg:col-span-1 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>Balance</CardTitle>
                  <CardAction>
                    <Wallet className="h-7 w-7 text-brand-light" />
                  </CardAction>
                </div>
              </CardHeader>
              <CardContent className="my-8">
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    {formatCurrency(data.balance)}
                  </div>
                  <div className="text-brand-gray">
                    Equity: {formatCurrency(data.equity)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Net Profit</CardTitle>
                  <CardAction>
                    <MoveUpRight className="h-7 w-7 text-brand-light" />
                  </CardAction>
                </div>
              </CardHeader>
              <CardContent className="my-8">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-brand-light">
                    {formatCurrency(metrics.netProfit)}
                  </div>
                  <div className="text-brand-gray">
                    Factor: {metrics.factor}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Monthly Profit</CardTitle>
                  <CardAction>
                    <Info className="h-7 w-7 text-brand-gray" />
                  </CardAction>
                </div>
              </CardHeader>
              <CardContent className="my-8">
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    {formatCurrency(metrics.monthlyProfit)}
                  </div>
                  <div className="text-brand-gray">Last 30 Days</div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <ChartWinRate
                winRate={Math.round(metrics.winRate)}
                won={metrics.won}
                lost={metrics.lost}
                total={metrics.total}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between ">
                  <CardTitle>Abs. Gain</CardTitle>
                  <CardAction>
                    <MoveUpRight className="h-7 w-7 text-brand-light" />
                  </CardAction>
                </div>
              </CardHeader>
              <CardContent className="mb-10">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-brand-light">
                    {metrics.absGain.toLocaleString("en-US", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </div>
                  <div className="text-brand-gray">
                    Daily: {metrics.dailyGain.toFixed(2)}
                  </div>
                </div>
                <div className="mt-20 pt-8 border-t">
                  <div className="flex items-center justify-between mb-6">
                    <CardTitle>Drawdown</CardTitle>
                    <Lock className="h-7 w-7 text-brand-light" />
                  </div>
                  <div className="mt-1 text-3xl font-bold ">
                    {metrics.drawdown}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 h-full">
            <ChartBarDefault
              deals={Array.isArray(data.deals) ? data.deals : []}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
