import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "safe" | "warning" | "critical";
}

const variantStyles = {
  default: "border-border",
  safe: "border-safe/30",
  warning: "border-warning/30",
  critical: "border-critical/30",
};

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, variant = "default" }) => (
  <div className={`bg-card rounded-xl border ${variantStyles[variant]} p-4 flex items-center gap-4`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
      variant === "safe" ? "bg-safe/10 text-safe" :
      variant === "warning" ? "bg-warning/10 text-warning" :
      variant === "critical" ? "bg-critical/10 text-critical" :
      "bg-secondary text-muted-foreground"
    }`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold font-mono">{value}</p>
    </div>
  </div>
);

export default StatCard;
