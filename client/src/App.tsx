import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Pets from "@/pages/pets";
import Appointments from "@/pages/appointments";
import Vaccinations from "@/pages/vaccinations";
import Feeding from "@/pages/feeding";
import Shop from "@/pages/shop";
import Orders from "@/pages/orders";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/app-layout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <AppLayout>
          <Route path="/" component={Dashboard} />
          <Route path="/pets" component={Pets} />
          <Route path="/appointments" component={Appointments} />
          <Route path="/vaccinations" component={Vaccinations} />
          <Route path="/feeding" component={Feeding} />
          <Route path="/shop" component={Shop} />
          <Route path="/orders" component={Orders} />
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
