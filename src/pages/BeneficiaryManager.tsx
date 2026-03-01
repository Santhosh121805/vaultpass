import { useState } from "react";
import { useVault, Beneficiary } from "@/context/VaultContext";
import { Plus, Trash2, Edit3, Check, X } from "lucide-react";

const BeneficiaryManager = () => {
  const { vault, addBeneficiary, updateBeneficiary, removeBeneficiary } = useVault();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ nickname: "", walletAddress: "", percentage: 0 });

  const totalAllocation = vault.beneficiaries.reduce((s, b) => s + b.percentage, 0);

  const handleSaveNew = () => {
    if (!form.nickname || !form.walletAddress || form.percentage <= 0) return;
    addBeneficiary(form);
    setForm({ nickname: "", walletAddress: "", percentage: 0 });
    setAdding(false);
  };

  const handleUpdate = (id: string) => {
    updateBeneficiary(id, form);
    setEditing(null);
    setForm({ nickname: "", walletAddress: "", percentage: 0 });
  };

  const startEdit = (b: Beneficiary) => {
    setEditing(b.id);
    setForm({ nickname: b.nickname, walletAddress: b.walletAddress, percentage: b.percentage });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Beneficiaries</h1>
          <p className="text-muted-foreground mt-1">Manage who receives your assets</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Total allocation bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Total Allocation</span>
          <span className={`font-mono font-bold ${totalAllocation === 100 ? "text-safe" : "text-warning"}`}>{totalAllocation}%</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
          {vault.beneficiaries.map((b, i) => {
            const colors = ["bg-primary", "bg-safe", "bg-info", "bg-warning"];
            return (
              <div
                key={b.id}
                className={`${colors[i % colors.length]} h-full transition-all duration-500`}
                style={{ width: `${b.percentage}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Beneficiary list */}
      <div className="space-y-3">
        {vault.beneficiaries.map((b, i) => {
          const colors = ["bg-primary", "bg-safe", "bg-info", "bg-warning"];
          const isEditing = editing === b.id;

          return (
            <div key={b.id} className="bg-card rounded-xl border border-border p-4">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <input value={form.nickname} onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))} className="bg-muted rounded-lg px-3 py-2 text-sm text-foreground" placeholder="Nickname" />
                    <input value={form.walletAddress} onChange={e => setForm(f => ({ ...f, walletAddress: e.target.value }))} className="bg-muted rounded-lg px-3 py-2 text-sm font-mono text-foreground" placeholder="0x..." />
                    <input type="number" value={form.percentage} onChange={e => setForm(f => ({ ...f, percentage: Number(e.target.value) }))} className="bg-muted rounded-lg px-3 py-2 text-sm font-mono text-foreground" placeholder="%" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground p-1"><X className="w-4 h-4" /></button>
                    <button onClick={() => handleUpdate(b.id)} className="text-safe hover:opacity-80 p-1"><Check className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`} />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{b.nickname}</p>
                    <p className="text-xs text-muted-foreground font-mono">{b.walletAddress}</p>
                  </div>
                  <div className="font-mono font-bold text-sm">{b.percentage}%</div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`${colors[i % colors.length]} h-full rounded-full`} style={{ width: `${b.percentage}%` }} />
                  </div>
                  <button onClick={() => startEdit(b)} className="text-muted-foreground hover:text-foreground p-1"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => removeBeneficiary(b.id)} className="text-muted-foreground hover:text-critical p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add form */}
        {adding && (
          <div className="bg-card rounded-xl border border-primary/30 p-4 space-y-3">
            <p className="text-sm font-semibold">New Beneficiary</p>
            <div className="grid grid-cols-3 gap-3">
              <input value={form.nickname} onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))} className="bg-muted rounded-lg px-3 py-2 text-sm text-foreground" placeholder="Nickname" />
              <input value={form.walletAddress} onChange={e => setForm(f => ({ ...f, walletAddress: e.target.value }))} className="bg-muted rounded-lg px-3 py-2 text-sm font-mono text-foreground" placeholder="0x..." />
              <input type="number" value={form.percentage || ""} onChange={e => setForm(f => ({ ...f, percentage: Number(e.target.value) }))} className="bg-muted rounded-lg px-3 py-2 text-sm font-mono text-foreground" placeholder="%" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setAdding(false); setForm({ nickname: "", walletAddress: "", percentage: 0 }); }} className="text-muted-foreground hover:text-foreground px-3 py-1 text-sm">Cancel</button>
              <button onClick={handleSaveNew} className="bg-safe text-safe-foreground px-4 py-1 rounded-lg text-sm font-semibold hover:opacity-90">Save</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeneficiaryManager;
