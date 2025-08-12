import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Pets from "@/pages/pets";
import PetOwners from "@/pages/pet-owners";
import Appointments from "@/pages/appointments";
import Vaccinations from "@/pages/vaccinations";
import MedicalRecords from "@/pages/medical-records";
import Feeding from "@/pages/feeding";
import Shop from "@/pages/shop";
import Orders from "@/pages/orders";
import Inventory from "@/pages/inventory";
import Staff from "@/pages/staff";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/app-layout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
        </>
      ) : (
        <AppLayout>
          <Route path="/" component={Dashboard} />
          <Route path="/pets" component={Pets} />
          <Route path="/owners" component={PetOwners} />
          <Route path="/appointments" component={Appointments} />
          <Route path="/vaccinations" component={Vaccinations} />
          <Route path="/medical-records" component={MedicalRecords} />
          <Route path="/feeding" component={Feeding} />
          <Route path="/shop" component={Shop} />
          <Route path="/orders" component={Orders} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/staff" component={Staff} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/profile" component={Profile} />
          <Route path="/settings" component={Settings} />
        </AppLayout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
