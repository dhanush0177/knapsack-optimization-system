import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Visualizer from "@/pages/Visualizer";
import Benchmarking from "@/pages/Benchmarking";
import Analytics from "@/pages/Analytics";
import Complexity from "@/pages/Complexity";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import GreedyAnalysis from "@/pages/GreedyAnalysis";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/visualizer" component={Visualizer} />
        <Route path="/benchmark" component={Benchmarking} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/compare" component={Complexity} />
        <Route path="/greedy" component={GreedyAnalysis} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AppProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
