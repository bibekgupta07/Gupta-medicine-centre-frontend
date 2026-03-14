import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "green" | "blue" | "purple" | "orange" | "red";
}

const colorMap = {
  green: "bg-green-50 text-green-600",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
};

export default function StatsCard({ title, value, icon: Icon, trend, color = "green" }: StatsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={cn("text-xs mt-1", trend.value >= 0 ? "text-green-600" : "text-red-600")}>
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", colorMap[color])}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
