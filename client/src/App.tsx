import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import ProtestDetail from "@/pages/protest-detail";
import SignIn from "@/pages/sign-in";
import Filter from "@/pages/filter";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/context/auth-context";

function AuthenticatedRouter() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/protest/:id" component={ProtestDetail} />
      <Route path="/filter" component={Filter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/sign-in" component={SignIn} />
      <Route path="/*">
        <AuthenticatedRouter />
      </Route>
    </Switch>
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