import { useVault } from "@/context/VaultContext";
import CountdownRing from "@/components/CountdownRing";
import StatCard from "@/components/StatCard";
import { Users, Link2, Timer, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { vault, checkIn } = useVault();
  const navigate = useNavigate();

  const daysRemaining = Math.max(0, Math.ceil((vault.nextDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const showCheckInButton = daysRemaining <= 30;

  const statusIcon = vault.vaultStatus === "Safe" ? ShieldCheck : vault.vaultStatus === "Warning" ? ShieldAlert : ShieldX;
  const statusVariant = vault.vaultStatus === "Safe" ? "safe" : vault.vaultStatus === "Warning" ? "warning" : "critical";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your vault at a glance</p>
      </div>

      {/* Vault Value + Countdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-8 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Total Vault Value</p>
          <p className="text-4xl font-bold font-mono">{vault.totalValueETH.toFixed(3)} <span className="text-lg text-muted-foreground">ETH</span></p>
          <p className="text-muted-foreground font-mono text-sm mt-1">${vault.totalValueUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-8 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Next Check-In</p>
          <CountdownRing
            daysRemaining={daysRemaining}
            totalDays={vault.checkInIntervalDays}
            status={vault.vaultStatus}
          />
          {showCheckInButton && (
            <button
              onClick={() => { checkIn(); navigate("/check-in"); }}
              className="mt-6 bg-safe text-safe-foreground px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity glow-green"
            >
              Check In Now
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Beneficiaries" value={vault.beneficiaries.length} icon={Users} />
        <StatCard label="Chains" value={vault.chainsConnected} icon={Link2} />
        <StatCard label="Interval" value={`${vault.checkInIntervalDays}d`} icon={Timer} />
        <StatCard label="Status" value={vault.vaultStatus} icon={statusIcon} variant={statusVariant} />
      </div>
    </div>
  );
};

export default Dashboard;
