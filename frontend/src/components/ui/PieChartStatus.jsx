"use client";

import React from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const COLORS = {
  LIVE: "#22c55e", 
  SCHEDULED: "#3b82f6", 
  CLOSED: "#ef4444", 
};

const STATUS_LABELS = {
  LIVE: "Live",
  SCHEDULED: "Scheduled",
  CLOSED: "Closed",
};

export function PieChartStatus({ statusCounts }) {
  const data = [
    { name: "LIVE", value: statusCounts?.LIVE || 0 },
    { name: "SCHEDULED", value: statusCounts?.SCHEDULED || 0 },
    { name: "CLOSED", value: statusCounts?.CLOSED || 0 },
  ];

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="items-center text-center">
        <CardTitle>Auctions by Status</CardTitle>
        <CardDescription>Status Distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="h-[300px] w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label={({ name }) => STATUS_LABELS[name]}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name] || "#ccc"}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex justify-center gap-4 text-sm">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: COLORS[entry.name] }}
              />
              <span>{STATUS_LABELS[entry.name]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
