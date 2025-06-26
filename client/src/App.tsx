import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import ProtestDetail from "@/pages/protest-detail";
import SignIn from "@/pages/sign-in";
import Filter from "@/pages/filter";
import CreateProtest from "@/pages/create-protest";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/context/auth-context";

function AuthenticatedRouter() {
  const { isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-in fade-in duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div key={location} className="animate-in fade-in duration-300">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/protest/:id" component={ProtestDetail} />
        <Route path="/filter" component={Filter} />
        <Route path="/create-protest" component={CreateProtest} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function AppRouter() {
  const [location] = useLocation();
  
  return (
    <div key={location} className="animate-in fade-in duration-300">
      <Switch>
        <Route path="/sign-in" component={SignIn} />
        <Route path="/*">
          <AuthenticatedRouter />
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;