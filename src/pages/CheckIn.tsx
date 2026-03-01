import { useState } from "react";
import { useVault } from "@/context/VaultContext";
import CountdownRing from "@/components/CountdownRing";
import { CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const CheckIn = () => {
  const { vault, checkIn } = useVault();
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const daysRemaining = Math.max(0, Math.ceil((vault.nextDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const handleCheckIn = () => {
    checkIn();
    setJustCheckedIn(true);
    setTimeout(() => setJustCheckedIn(false), 5000);
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col items-center text-center py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Check In</h1>
        <p className="text-muted-foreground mt-1">Prove you're still here</p>
      </div>

      <CountdownRing
        daysRemaining={daysRemaining}
        totalDays={vault.checkInIntervalDays}
        size={260}
        strokeWidth={10}
        status={vault.vaultStatus}
      />

      {justCheckedIn ? (
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-500">
          <CheckCircle2 className="w-16 h-16 text-safe" />
          <p className="text-safe font-bold text-lg">Check-in confirmed!</p>
          <p className="text-muted-foreground text-sm">Your vault is safe. See you in {vault.checkInIntervalDays} days.</p>
        </div>
      ) : (
        <button
          onClick={handleCheckIn}
          className="w-48 h-48 rounded-full bg-safe text-safe-foreground font-bold text-lg hover:opacity-90 transition-all glow-green flex items-center justify-center"
        >
          I'm Alive —<br />Check In
        </button>
      )}

      <div className="text-sm text-muted-foreground">
        <p>Last check-in: <span className="font-mono text-foreground">{format(vault.lastCheckIn, "MMM d, yyyy 'at' h:mm a")}</span></p>
      </div>
    </div>
  );
};

export default CheckIn;
