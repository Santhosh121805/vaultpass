import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VaultProvider } from "@/context/VaultContext";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import CheckIn from "./pages/CheckIn";
import BeneficiaryManager from "./pages/BeneficiaryManager";
import VaultSetup from "./pages/VaultSetup";
import Alerts from "./pages/Alerts";
import ClaimPortal from "./pages/ClaimPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <VaultProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/check-in" element={<CheckIn />} />
              <Route path="/beneficiaries" element={<BeneficiaryManager />} />
              <Route path="/setup" element={<VaultSetup />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/claim" element={<ClaimPortal />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </VaultProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
