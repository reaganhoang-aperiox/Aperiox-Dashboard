import type { Deal } from "@/services/api";

export interface CalculatedMetrics {
  netProfit: number;
  factor: number;
  weekProfit: number;
  todayProfit: number;
  winRate: number;
  won: number;
  lost: number;
  total: number;
  absGain: number;
  dailyGain: number;
  grossProfit: number;
  grossLoss: number;
}

export const calculateMetrics = (
  deals: Deal[],
  currentBalance: number,
  initialBalance: number = 0
): CalculatedMetrics => {
  // Filter only closed trades (DEAL_ENTRY_OUT)
  const closedTrades = deals.filter(
    (d) => d.entryType === "DEAL_ENTRY_OUT" && d.type !== "DEAL_TYPE_BALANCE"
  );

  // Calculate won and lost trades
  const wonTrades = closedTrades.filter((d) => d.profit > 0);
  const lostTrades = closedTrades.filter((d) => d.profit < 0);

  // Calculate net profit (sum of all profits including commission and swap)
  const netProfit = closedTrades.reduce(
    (sum, d) => sum + d.profit + d.commission + d.swap,
    0
  );

  // Calculate gross profit and loss
  const grossProfit = wonTrades.reduce(
    (sum, d) => sum + d.profit + d.commission + d.swap,
    0
  );
  const grossLoss = Math.abs(
    lostTrades.reduce((sum, d) => sum + d.profit + d.commission + d.swap, 0)
  );

  // Calculate profit factor
  const factor = grossLoss > 0 ? grossProfit / grossLoss : 0;

  // Calculate win rate
  const winRate =
    closedTrades.length > 0
      ? (wonTrades.length / closedTrades.length) * 100
      : 0;

  // Calculate today's profit
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayProfit = closedTrades
    .filter((d) => new Date(d.time) >= today)
    .reduce((sum, d) => sum + d.profit + d.commission + d.swap, 0);

  // Calculate week profit (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  const weekProfit = closedTrades
    .filter((d) => new Date(d.time) >= weekAgo)
    .reduce((sum, d) => sum + d.profit + d.commission + d.swap, 0);

  // Calculate absolute gain
  const absGain =
    initialBalance > 0
      ? ((currentBalance - initialBalance) / initialBalance) * 100
      : 0;

  // Calculate daily gain (average)
  const firstTradeDate =
    closedTrades.length > 0 ? new Date(closedTrades[0].time) : new Date();
  const daysSinceStart = Math.max(
    1,
    Math.floor((Date.now() - firstTradeDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const dailyGain = netProfit / daysSinceStart;

  return {
    netProfit,
    factor: Math.round(factor * 100) / 100,
    weekProfit,
    todayProfit,
    winRate: Math.round(winRate * 100) / 100,
    won: wonTrades.length,
    lost: lostTrades.length,
    total: closedTrades.length,
    absGain: Math.round(absGain * 100) / 100,
    dailyGain: Math.round(dailyGain * 100) / 100,
    grossProfit,
    grossLoss,
  };
};

export interface MonthlyData {
  month: string;
  gain: number;
  balance: number;
  profit: number;
}

export const calculateMonthlyData = (
  deals: Deal[],
  initialBalance: number,
  year?: number
): MonthlyData[] => {
  const closedTrades = deals.filter(
    (d) => d.entryType === "DEAL_ENTRY_OUT" && d.type !== "DEAL_TYPE_BALANCE"
  );

  const monthlyMap = new Map<string, { profit: number; balance: number }>();
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

  let runningBalance = initialBalance;

  // Group deals by month
  closedTrades.forEach((deal) => {
    const date = new Date(deal.time);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

    const profit = deal.profit + deal.commission + deal.swap;

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { profit: 0, balance: runningBalance });
    }

    const monthData = monthlyMap.get(monthKey)!;
    monthData.profit += profit;
    runningBalance += profit;
    monthData.balance = runningBalance;
  });

  // Convert to array and calculate gain
  const monthlyData: MonthlyData[] = [];
  const targetYear = year || new Date().getFullYear();

  for (let i = 0; i < 12; i++) {
    const monthKey = `${targetYear}-${i}`;
    const data = monthlyMap.get(monthKey);

    if (data) {
      const startBalance =
        i === 0
          ? initialBalance
          : monthlyData[i - 1]?.balance || initialBalance;
      const gain = startBalance > 0 ? (data.profit / startBalance) * 100 : 0;

      monthlyData.push({
        month: months[i],
        gain: Math.round(gain * 100) / 100,
        balance: Math.round(data.balance * 100) / 100,
        profit: Math.round(data.profit * 100) / 100,
      });
    } else {
      // Fill empty months
      const prevBalance =
        i > 0 ? monthlyData[i - 1]?.balance || initialBalance : initialBalance;
      monthlyData.push({
        month: months[i],
        gain: 0,
        balance: prevBalance,
        profit: 0,
      });
    }
  }

  return monthlyData;
};

// Calculate drawdown (simplified - requires equity curve for accurate calculation)
export const calculateDrawdown = (deals: Deal[]): number => {
  const closedTrades = deals.filter(
    (d) => d.entryType === "DEAL_ENTRY_OUT" && d.type !== "DEAL_TYPE_BALANCE"
  );

  if (closedTrades.length === 0) return 0;

  let peak = 0;
  let maxDrawdown = 0;
  let runningBalance = 0;

  closedTrades.forEach((deal) => {
    runningBalance += deal.profit + deal.commission + deal.swap;

    if (runningBalance > peak) {
      peak = runningBalance;
    }

    const drawdown = peak > 0 ? ((peak - runningBalance) / peak) * 100 : 0;

    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return Math.round(maxDrawdown * 100) / 100;
};
