"use client";

import React, { useState } from "react";
import { formatInteger } from "@/components/formater";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";
import { UserCheck, TrendingUp, Sparkles } from "lucide-react";

interface MonthlyData {
  month: string;
  short: string;
  candidates: number;
}

const chartData: MonthlyData[] = [
  { month: "January", short: "Jan", candidates: 22 },
  { month: "February", short: "Feb", candidates: 28 },
  { month: "March", short: "Mar", candidates: 31 },
  { month: "April", short: "Apr", candidates: 29 },
  { month: "May", short: "May", candidates: 35 },
  { month: "June", short: "Jun", candidates: 38 },
  { month: "July", short: "Jul", candidates: 42 },
  { month: "August", short: "Aug", candidates: 45 },
  { month: "September", short: "Sep", candidates: 40 },
  { month: "October", short: "Oct", candidates: 48 },
  { month: "November", short: "Nov", candidates: 51 },
  { month: "December", short: "Dec", candidates: 46 },
];

const closedThisMonth = chartData.find((d) => d.month === "July")?.candidates || 42;
const monthlyTarget = 45;

export function VisitorsChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(6); // Default highlight July

  // Chart coordinates calculation
  const width = 800;
  const height = 220;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 40;

  const minVal = 15;
  const maxVal = 60;

  const getX = (index: number) => {
    return paddingX + (index / (chartData.length - 1)) * (width - paddingX * 2);
  };

  const getY = (value: number) => {
    const chartHeight = height - paddingTop - paddingBottom;
    return height - paddingBottom - ((value - minVal) / (maxVal - minVal)) * chartHeight;
  };

  // Generate smooth cubic bezier SVG path
  const points = chartData.map((d, i) => ({ x: getX(i), y: getY(d.candidates) }));

  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 3;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (2 * (next.x - curr.x)) / 3;
      const cpY2 = next.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  const activeItem = hoveredIdx !== null ? chartData[hoveredIdx] : chartData[6];
  const activePt = hoveredIdx !== null ? points[hoveredIdx] : points[6];

  return (
    <Card className="col-span-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <UserCheck className="h-4 w-4" />
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Candidates Closed This Month
            </CardTitle>
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
              {formatInteger(closedThisMonth)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              out of {monthlyTarget} monthly placement quota ({Math.round((closedThisMonth / monthlyTarget) * 100)}%)
            </span>
          </div>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Monthly executive candidates successfully placed across client mandates
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Delta value={10.5} variant="badge">
            <DeltaIcon variant="trend" />
            <DeltaValue suffix="%" />
            <span>vs last month</span>
          </Delta>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="relative w-full overflow-hidden">
          {/* Active tooltip hover indicator */}
          {activeItem && activePt && (
            <div
              className="absolute z-10 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs px-2.5 py-1.5 rounded-lg shadow-lg flex flex-col items-center"
              style={{
                left: `${(activePt.x / width) * 100}%`,
                top: `${(activePt.y / height) * 100 - 4}%`,
              }}
            >
              <span className="font-bold text-[11px]">{activeItem.month}</span>
              <span className="font-mono font-black text-xs text-emerald-400 dark:text-emerald-700">
                {activeItem.candidates} Placed
              </span>
            </div>
          )}

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-56 sm:h-64 select-none overflow-visible"
          >
            <defs>
              <linearGradient id="execAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal dashed lines */}
            {[20, 35, 50].map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeDasharray="4 4"
                    className="text-slate-400 dark:text-slate-600"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Gradient Filled Area */}
            <path d={areaPath} fill="url(#execAreaGradient)" />

            {/* Smooth Stroke Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Points & Hover Targets */}
            {points.map((pt, i) => {
              const isHovered = hoveredIdx === i;
              const isCurrent = chartData[i].month === "July";
              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(6)}
                >
                  {/* Invisible wide hit area */}
                  <rect
                    x={pt.x - 20}
                    y={0}
                    width={40}
                    height={height}
                    fill="transparent"
                  />

                  {/* Vertical guide line on hover */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={paddingTop}
                      x2={pt.x}
                      y2={height - paddingBottom}
                      stroke="#10B981"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      strokeOpacity="0.5"
                    />
                  )}

                  {/* Circle Marker */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : isCurrent ? 4.5 : 3.5}
                    className="transition-all duration-150"
                    fill={isHovered ? "#10B981" : isCurrent ? "#059669" : "#10B981"}
                    stroke="#FFFFFF"
                    strokeWidth={isHovered ? 2.5 : 2}
                  />

                  {/* Month Label */}
                  <text
                    x={pt.x}
                    y={height - paddingBottom + 18}
                    textAnchor="middle"
                    className={`text-[11px] transition-colors ${
                      isHovered || isCurrent
                        ? "fill-slate-900 dark:fill-slate-100 font-bold"
                        : "fill-slate-400 dark:fill-slate-500 font-medium"
                    }`}
                  >
                    {chartData[i].short}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
export default VisitorsChart;
