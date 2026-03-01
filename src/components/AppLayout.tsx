import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Shield, HeartPulse, Users, Bell, Settings } from "lucide-react";
import { useVault } from "@/context/VaultContext";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/check-in", label: "Check In", icon: HeartPulse },
  { path: "/beneficiaries", label: "Beneficiaries", icon: Users },
  { path: "/alerts", label: "Alerts", icon: Bell },
  { path: "/setup", label: "Setup Vault", icon: Settings },
];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { vault } = useVault();

  // Don't show nav on claim portal
  if (location.pathname.startsWith("/claim")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">VaultPass</span>
        </Link>
        <div className="flex items-center gap-4">
          {vault.isConnected ? (
            <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
              <span className="font-mono text-xs text-foreground">{vault.walletAddress.slice(0, 6)}...{vault.walletAddress.slice(-4)}</span>
            </div>
          ) : (
            <Link to="/setup" className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              Connect Wallet
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-56 border-r border-border p-4 hidden md:flex flex-col gap-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex justify-around py-2">
          {navItems.slice(0, 4).map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6 pb-24 md:pb-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
