import { useVault } from "@/context/VaultContext";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import { format } from "date-fns";

const iconMap = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styleMap = {
  critical: "border-critical/30 bg-critical/5 text-critical",
  warning: "border-warning/30 bg-warning/5 text-warning",
  info: "border-info/30 bg-info/5 text-info",
};

const Alerts = () => {
  const { vault } = useVault();
  const navigate = useNavigate();

  const sorted = [...vault.alerts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alerts</h1>
        <p className="text-muted-foreground mt-1">Stay informed about your vault</p>
      </div>

      <div className="space-y-3">
        {sorted.map(alert => {
          const Icon = iconMap[alert.type];
          return (
            <button
              key={alert.id}
              onClick={() => navigate(alert.route)}
              className={`w-full text-left rounded-xl border p-4 flex items-start gap-4 transition-opacity hover:opacity-80 ${styleMap[alert.type]}`}
            >
              <Icon className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{alert.message}</p>
                <p className="text-xs mt-1 opacity-70 font-mono">{format(alert.timestamp, "MMM d, yyyy 'at' h:mm a")}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Alerts;
