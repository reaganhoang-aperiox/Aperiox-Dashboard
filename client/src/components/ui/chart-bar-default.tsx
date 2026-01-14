import { useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { calculateMonthlyData } from "@/utils/calculateMetrics";
import type { Deal } from "@/services/api";

export const description = "A bar chart";

type ChartView = "gain" | "balance" | "profit";

const chartConfig = {
  gain: {
    label: "Gain",
    color: "var(--brand-light)",
  },
  balance: {
    label: "Balance",
    color: "var(--brand-light)",
  },
  profit: {
    label: "Profit",
    color: "var(--brand-light)",
  },
} satisfies ChartConfig;

export function ChartBarDefault({
  deals,
  selectedYear,
  onYearChange,
}: {
  deals: Deal[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}) {
  const [view, setView] = useState<ChartView>("balance");

  // Generate year options dynamically (current year and 10 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

  const monthlyData = useMemo(() => {
    if (!deals || deals.length === 0) {
      // Return empty data for all months if no deals
      const months = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];
      return months.map((month) => ({
        month,
        gain: 0,
        balance: 0,
        profit: 0,
      }));
    }

    // Filter deals for the selected year
    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
    const yearDeals = deals.filter((d) => {
      const dealDate = new Date(d.time);
      return dealDate >= yearStart && dealDate <= yearEnd;
    });

    if (yearDeals.length === 0) {
      // Return empty data for all months if no deals for this year
      const months = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];
      return months.map((month) => ({
        month,
        gain: 0,
        balance: 0,
        profit: 0,
      }));
    }

    // Get initial balance for this year - find balance deals before or at start of year
    const balanceDealsBeforeYear = deals
      .filter((d) => {
        if (d.type !== "DEAL_TYPE_BALANCE") return false;
        const dealDate = new Date(d.time);
        return dealDate < yearStart;
      })
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    // Calculate starting balance for the year
    let initialBalance = 0;
    if (balanceDealsBeforeYear.length > 0) {
      // Sum all balance changes before the year
      const totalBalanceBeforeYear = balanceDealsBeforeYear.reduce(
        (sum, d) => sum + d.profit,
        0
      );
      initialBalance = Math.max(0, totalBalanceBeforeYear);
    }

    // If no balance deals before year, try to estimate from first trade of the year
    if (initialBalance === 0) {
      const firstTradeOfYear = yearDeals
        .filter(
          (d) =>
            d.entryType === "DEAL_ENTRY_OUT" && d.type !== "DEAL_TYPE_BALANCE"
        )
        .sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        )[0];

      if (firstTradeOfYear) {
        // Estimate: use a reasonable starting balance
        initialBalance = 100000; // Default estimate
      } else {
        initialBalance = 100000; // Default fallback
      }
    }

    return calculateMonthlyData(yearDeals, initialBalance, selectedYear);
  }, [deals, selectedYear]);

  const formatValue = (value: number) => {
    if (view === "gain") {
      return `${value.toFixed(2)}%`;
    }
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  };

  const chartData = monthlyData.map((item) => ({
    month: item.month,
    [view]: item[view],
  }));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
          <div className="flex gap-2">
            <Button
              variant={view === "gain" ? "brand" : "chart-inactive"}
              size="rounded"
              onClick={() => setView("gain")}
            >
              Gain (%)
            </Button>
            <Button
              variant={view === "balance" ? "brand" : "chart-inactive"}
              size="rounded"
              onClick={() => setView("balance")}
            >
              Balance ($)
            </Button>
            <Button
              variant={view === "profit" ? "brand" : "chart-inactive"}
              size="rounded"
              onClick={() => setView("profit")}
            >
              Profit ($)
            </Button>
          </div>
          <div className="hidden md:block w-px h-8 bg-foreground/10"></div>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => onYearChange(parseInt(value))}
          >
            <SelectTrigger
              size="sm"
              className="border bg-transparent rounded-full"
            >
              <SelectValue placeholder={`${selectedYear}`} />
            </SelectTrigger>
            <SelectContent className="dark">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pl-0">
        <ChartContainer
          config={chartConfig}
          className="flex-1 w-full min-h-0"
          id="monthly-performance-chart"
        >
          <BarChart barSize={40} accessibilityLayer data={chartData}>
            <CartesianGrid
              strokeDasharray="2 2"
              stroke="hsl(var(--muted-foreground) / 0.3)"
              vertical={true}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              domain={[0, "dataMax"]}
              allowDataOverflow={false}
              tickFormatter={
                view === "gain"
                  ? (value) => `${value.toFixed(0)}%`
                  : (value) => {
                      if (value >= 1000000) {
                        return `$${(value / 1000000).toFixed(1)}M`;
                      }
                      if (value >= 1000) {
                        return `$${(value / 1000).toFixed(0)}K`;
                      }
                      return `$${value.toFixed(0)}`;
                    }
              }
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  const value = data.payload[view] as number;
                  return (
                    <div className="rounded-xl bg-card p-6 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-foreground text-xl font-bold">
                            {data.payload.month}
                          </span>
                          <span className="font-normal text-lg text-brand-light">
                            {view === "gain"
                              ? `Gain: ${formatValue(value)}`
                              : formatValue(value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey={view}
              fill={`var(--color-${view})`}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
