import type { LucideIcon } from "lucide-react";

interface DashboardStatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
}

export function DashboardStatsCard({
  title,
  value,
  description,
  icon: Icon,
}: DashboardStatsCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className="rounded-lg bg-blue-50 p-2">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      <h2 className="mt-4 text-3xl font-bold text-slate-900">{value}</h2>

      {description && (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
}
