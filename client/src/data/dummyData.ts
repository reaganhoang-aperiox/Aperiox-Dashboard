export interface AccountMetrics {
  balance: number;
  equity: number;
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
  drawdown: number;
}

export interface MonthlyData {
  month: string;
  gain: number;
  balance: number;
  profit: number;
}

export const accountMetrics: AccountMetrics = {
  balance: 7604.07,
  equity: 4241.56,
  netProfit: 10081,
  factor: 3.62,
  weekProfit: 0.0,
  todayProfit: 0.0,
  winRate: 90,
  won: 4404,
  lost: 473,
  total: 4877,
  absGain: 1303.53,
  dailyGain: 0.36,
  drawdown: 847.9,
};

export const monthlyData2025: MonthlyData[] = [
  { month: "JAN", gain: 9.0, balance: 8300000, profit: 695650 },
  { month: "FEB", gain: 5.0, balance: 8715000, profit: 435750 },
  { month: "MAR", gain: 2.5, balance: 8932875, profit: 223322 },
  { month: "APR", gain: 5.3, balance: 9379519, profit: 468976 },
  { month: "MAY", gain: 6.0, balance: 9989188, profit: 649293 },
  { month: "JUN", gain: 18.1, balance: 11799211, profit: 2130023 },
  { month: "JUL", gain: 5.0, balance: 12507164, profit: 707953 },
  { month: "AUG", gain: 3.5, balance: 13007450, profit: 520298 },
  { month: "SEP", gain: 3.5, balance: 13527748, profit: 520298 },
  { month: "OCT", gain: 6.0, balance: 14407052, profit: 879304 },
  { month: "NOV", gain: 4.0, balance: 15055369, profit: 648317 },
  { month: "DEC", gain: 0.5, balance: 15070424, profit: 15055 },
];
