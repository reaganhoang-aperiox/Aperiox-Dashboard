import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useState, useEffect } from "react";

export interface WinRateData {
  winRate: number;
  won: number;
  lost: number;
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const chartConfig = {
  won: {
    label: "Won",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface StatItemProps {
  value: number;
  label: string;
  color: "chart" | "destructive" | "foreground";
}

function StatItem({ value, label, color }: StatItemProps) {
  const colorClass =
    color === "chart"
      ? "text-brand-light"
      : color === "destructive"
      ? "text-destructive"
      : "text-foreground";

  return (
    <div className="text-center border border-card py-1.5 px-3 md:px-6 rounded-md">
      <div className={`text-lg md:text-2xl font-semibold ${colorClass}`}>
        {value}
      </div>
      <div className="text-sm text-brand-gray mt-1">{label}</div>
    </div>
  );
}

export function ChartWinRate({
  winRate,
  won,
  lost,
  total,
  currentPage,
  totalPages,
  onPageChange,
}: WinRateData) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const chartData = [
    {
      name: "Won",
      value: winRate,
      fill: "var(--brand-light)",
    },
  ];

  const safeWinRate = Math.min(100, Math.max(0, winRate));
  const endAngle = (safeWinRate / 100) * 360;

  // Responsive chart dimensions
  const innerRadius = isMobile ? 86 : 105;
  const outerRadius = isMobile ? 116 : 150;
  const polarRadius = isMobile ? [92, 80] : [113, 98];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Win Rate</CardTitle>
          <div className="flex items-center gap-1 text-md text-brand-gray">
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-6 w-6"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span>
              {currentPage}/{totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-6 w-6"
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex py-8 px-4 gap-4 items-center">
        <ChartContainer
          config={chartConfig}
          className={`mx-auto aspect-square flex-1 ${
            isMobile ? "max-h-[220px]" : "max-h-[250px]"
          }`}
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={endAngle}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-brand-light-alt last:fill-background"
              polarRadius={polarRadius}
            />

            <RadialBar dataKey="value" background cornerRadius={10} />

            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className={`fill-brand-light font-bold  ${
                            isMobile ? "text-2xl" : "text-[2.5rem]"
                          }`}
                        >
                          {`${chartData[0].value}%`}
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
        <div className="space-y-4">
          <StatItem value={won} label="Won" color="chart" />
          <StatItem value={lost} label="Lost" color="destructive" />
          <StatItem value={total} label="Total" color="foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
