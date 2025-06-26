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
import ProtectedRoute from "@/components/protected-route";

function AuthenticatedRouter() {
  return (
    <>
      <main className="pb-16">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/filter" component={Filter} />
          <Route path="/protest/:id">
            {(params) => <ProtestDetail protestId={params.id!} />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNavigation />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Switch>
                <Route path="/sign-in" component={SignIn} />
                <Route>
                  <AuthenticatedRouter />
                </Route>
              </Switch>
            </div>
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;