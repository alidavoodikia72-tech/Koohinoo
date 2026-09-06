"use client";

import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

type RevenuePoint = {
  key: string;
  label: string;
  revenue: number;
};

type PaymentStatus = "SUCCESS" | "PENDING" | "FAILED";

type PaymentStatusPoint = {
  status: PaymentStatus;
  count: number;
};

type AdminChartsProps = {
  revenue6Months: RevenuePoint[];
  paymentStatus: PaymentStatusPoint[];
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;
}

function isPaymentStatus(value: string): value is PaymentStatus {
  return value === "SUCCESS" || value === "PENDING" || value === "FAILED";
}

function statusLabelFa(status: PaymentStatus) {
  switch (status) {
    case "SUCCESS":
      return "موفق";
    case "PENDING":
      return "در انتظار";
    case "FAILED":
      return "ناموفق";
  }
}

const STATUS_COLORS: Record<PaymentStatus, string> = {
  SUCCESS: "#16a34a",
  PENDING: "#f59e0b",
  FAILED: "#dc2626",
};

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function AdminCharts({ revenue6Months, paymentStatus }: AdminChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* درآمد ۶ ماه اخیر */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="mb-4 text-sm font-black text-zinc-800 dark:text-zinc-100">روند درآمد ۶ ماه اخیر</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenue6Months} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v: number) => formatNumber(v)} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [formatCurrency(toNumber(value)), "درآمد"]}
                labelFormatter={(label: ReactNode) => `ماه: ${String(label ?? "")}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* وضعیت پرداخت‌ها در ۳۰ روز اخیر */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="mb-4 text-sm font-black text-zinc-800 dark:text-zinc-100">
          وضعیت پرداخت‌ها (۳۰ روز اخیر)
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentStatus} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="status"
                tickFormatter={(value: string) =>
                  isPaymentStatus(value) ? statusLabelFa(value) : value
                }
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [formatNumber(toNumber(value)), "تعداد"]}
                labelFormatter={(label: ReactNode) => {
                  const raw = String(label ?? "");
                  return `وضعیت: ${isPaymentStatus(raw) ? statusLabelFa(raw) : raw}`;
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {paymentStatus.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
