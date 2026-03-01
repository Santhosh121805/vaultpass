import { useState } from "react";
import { useVault } from "@/context/VaultContext";
import { useNavigate } from "react-router-dom";
import { Wallet, Users, Timer, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const steps = [
  { label: "Connect Wallet", icon: Wallet },
  { label: "Add Beneficiaries", icon: Users },
  { label: "Set Interval", icon: Timer },
  { label: "Deposit & Confirm", icon: Check },
];

const VaultSetup = () => {
  const { vault, addBeneficiary, setCheckInInterval, depositETH } = useVault();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [beneficiaries, setBeneficiaries] = useState<{ nickname: string; walletAddress: string; percentage: number }[]>([]);
  const [newB, setNewB] = useState({ nickname: "", walletAddress: "", percentage: 0 });
  const [interval, setInterval] = useState(90);
  const [depositAmount, setDepositAmount] = useState("1.0");

  const totalPct = beneficiaries.reduce((s, b) => s + b.percentage, 0);

  const handleNext = () => {
    if (step === 0 && !vault.isConnected) return;
    if (step === 1) {
      beneficiaries.forEach(b => addBeneficiary(b));
    }
    if (step === 2) {
      setCheckInInterval(interval);
    }
    if (step === 3) {
      depositETH(Number(depositAmount));
      navigate("/");
      return;
    }
    setStep(s => s + 1);
  };

  const addB = () => {
    if (!newB.nickname || !newB.walletAddress || newB.percentage <= 0) return;
    setBeneficiaries(prev => [...prev, newB]);
    setNewB({ nickname: "", walletAddress: "", percentage: 0 });
  };

  const canProceed = step === 0 ? vault.isConnected :
    step === 1 ? totalPct === 100 :
    step === 2 ? true :
    Number(depositAmount) > 0;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Setup Your Vault</h1>
        <p className="text-muted-foreground mt-1">Secure your crypto legacy in 4 steps</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              i < step ? "bg-safe text-safe-foreground" :
              i === step ? "bg-primary text-primary-foreground" :
              "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
            </div>
            {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < step ? "bg-safe" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-card rounded-xl border border-border p-8 min-h-[300px]">
        {step === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-8">
            <Wallet className="w-16 h-16 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Connect Your Wallet</h2>
              <p className="text-muted-foreground mt-2 text-sm">Connect via MetaMask or any supported wallet.</p>
            </div>
            <ConnectButton />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Add Beneficiaries</h2>
            <p className="text-muted-foreground text-sm">Allocations must total 100%. Current: <span className={`font-mono font-bold ${totalPct === 100 ? "text-safe" : "text-warning"}`}>{totalPct}%</span></p>
            {beneficiaries.map((b, i) => (
              <div key={i} className="flex items-center gap-3 bg-muted rounded-lg px-3 py-2">
                <span className="text-sm flex-1">{b.nickname}</span>
                <span className="font-mono text-xs text-muted-foreground">{b.walletAddress}</span>
                <span className="font-mono text-sm font-bold">{b.percentage}%</span>
                <button onClick={() => setBeneficiaries(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-critical"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
            <div className="grid grid-cols-4 gap-2">
              <input value={newB.nickname} onChange={e => setNewB(p => ({ ...p, nickname: e.target.value }))} className="bg-muted rounded-lg px-3 py-2 text-sm text-foreground" placeholder="Name" />
              <input value={newB.walletAddress} onChange={e => setNewB(p => ({ ...p, walletAddress: e.target.value }))} className="bg-muted rounded-lg px-3 py-2 text-sm font-mono text-foreground col-span-2" placeholder="0x..." />
              <div className="flex gap-1">
                <input type="number" value={newB.percentage || ""} onChange={e => setNewB(p => ({ ...p, percentage: Number(e.target.value) }))} className="bg-muted rounded-lg px-3 py-2 text-sm font-mono text-foreground w-full" placeholder="%" />
                <button onClick={addB} className="bg-primary text-primary-foreground rounded-lg px-3 hover:opacity-90"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center gap-6 py-8">
            <h2 className="text-xl font-bold">Set Check-In Interval</h2>
            <p className="text-muted-foreground text-sm text-center">How often must you prove you're alive?</p>
            <div className="flex gap-3">
              {[30, 90, 180].map(d => (
                <button
                  key={d}
                  onClick={() => setInterval(d)}
                  className={`px-6 py-4 rounded-xl font-mono font-bold text-lg border transition-colors ${
                    interval === d
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  {d}<span className="text-xs ml-1 font-sans">days</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center gap-6 py-8">
            <h2 className="text-xl font-bold">Deposit & Confirm</h2>
            <p className="text-muted-foreground text-sm text-center">Deposit ETH into your vault to finalize setup.</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                className="bg-muted rounded-lg px-4 py-3 text-lg font-mono text-foreground w-32 text-center"
              />
              <span className="text-muted-foreground font-mono">ETH</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step === 3 ? "Confirm & Launch Vault" : "Continue"} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default VaultSetup;
