import { useState } from "react";
import { Shield, Wallet, UserCheck, MapPin, ArrowDown, CheckCircle2 } from "lucide-react";

const claimSteps = [
  { icon: Wallet, title: "Create a Wallet", desc: "Download a wallet app like MetaMask or Coinbase Wallet. It's free and takes 2 minutes." },
  { icon: UserCheck, title: "Verify Your Identity", desc: "We'll ask a few simple questions to confirm you are the intended recipient." },
  { icon: MapPin, title: "Confirm Your Address", desc: "Enter your new wallet address so we know where to send the funds." },
  { icon: ArrowDown, title: "Receive Your Funds", desc: "Once verified, the smart contract will automatically transfer the assets to you." },
];

const ClaimPortal = () => {
  const [started, setStarted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary" />
        <span className="text-lg font-bold">VaultPass</span>
        <span className="text-xs text-muted-foreground ml-2">Claim Portal</span>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl w-full text-center space-y-8">
          {!started ? (
            <>
              <div className="space-y-4">
                <div className="w-20 h-20 bg-safe/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-safe" />
                </div>
                <h1 className="text-3xl font-bold">You've Been Chosen to Receive Crypto</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Someone who cared about you has set aside digital assets for you. This portal will guide you through claiming them — no crypto experience needed.
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Estimated Inheritance</p>
                <p className="text-3xl font-bold font-mono">3.729 <span className="text-lg text-muted-foreground">ETH</span></p>
                <p className="text-muted-foreground font-mono text-sm mt-1">≈ $12,678.60</p>
              </div>

              <button
                onClick={() => setStarted(true)}
                className="bg-safe text-safe-foreground px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity glow-green"
              >
                Start Claim Process
              </button>
            </>
          ) : (
            <div className="text-left space-y-6">
              <h2 className="text-2xl font-bold text-center">How to Claim Your Assets</h2>
              <p className="text-muted-foreground text-center text-sm">Follow these 4 simple steps. No rush — take your time.</p>
              <div className="space-y-4">
                {claimSteps.map((s, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 text-foreground">
                      <span className="font-mono font-bold text-sm">{i + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold flex items-center gap-2"><s.icon className="w-4 h-4 text-safe" />{s.title}</p>
                      <p className="text-muted-foreground text-sm mt-1">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center pt-4">
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
                  I've Created a Wallet — Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClaimPortal;
