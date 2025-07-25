import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string; // e.g., "+5.2% from last month"
  trendDirection?: "up" | "down" | "neutral";
}

export function StatsCard({ title, value, icon: Icon, description, trend, trendDirection = "neutral" }: StatsCardProps) {
  
  const trendColor = trendDirection === "up" ? "text-green-600 dark:text-green-400" :
                     trendDirection === "down" ? "text-red-600 dark:text-red-400" :
                     "text-muted-foreground";

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {description && !trend && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
        {trend && (
          <p className={cn("text-xs pt-1", trendColor)}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
