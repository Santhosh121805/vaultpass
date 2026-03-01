import React from "react";

interface CountdownRingProps {
  daysRemaining: number;
  totalDays: number;
  size?: number;
  strokeWidth?: number;
  status: "Safe" | "Warning" | "Critical";
}

const CountdownRing: React.FC<CountdownRingProps> = ({
  daysRemaining,
  totalDays,
  size = 200,
  strokeWidth = 8,
  status,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, daysRemaining / totalDays));
  const offset = circumference * (1 - progress);

  const colorClass = status === "Safe" ? "text-safe" : status === "Warning" ? "text-warning" : "text-critical";
  const glowClass = status === "Safe" ? "drop-shadow-[0_0_12px_hsl(145,63%,49%,0.5)]" : status === "Warning" ? "drop-shadow-[0_0_12px_hsl(30,90%,55%,0.5)]" : "drop-shadow-[0_0_12px_hsl(0,62%,46%,0.5)]";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className={`-rotate-90 ${glowClass}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-4xl font-bold font-mono ${colorClass}`}>{daysRemaining}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-widest">days left</span>
      </div>
    </div>
  );
};

export default CountdownRing;
