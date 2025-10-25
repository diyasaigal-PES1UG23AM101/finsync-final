import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ElderDashboard from "./pages/ElderDashboard";
import GuardianDashboard from "./pages/GuardianDashboard";
import ApprovalScreen from "./pages/ApprovalScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/elder"
              element={
                <ProtectedRoute allowedRole="elder">
                  <ElderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guardian"
              element={
                <ProtectedRoute allowedRole="guardian">
                  <GuardianDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approve/:transactionId"
              element={
                <ProtectedRoute>
                  <ApprovalScreen />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
