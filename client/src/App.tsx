import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/home";
import SignIn from "./pages/sign-in";
import CreateProtest from "@/pages/create-protest";
import ProtestDetail from "@/pages/protest-detail";
import Filter from "@/pages/filter";
import ThemeSettings from "@/pages/theme-settings";
import Profile from "@/pages/profile";
import Discover from "./pages/discover";
import Resources from "./pages/resources";
import Saved from "./pages/saved";

import KnowYourRights from "@/pages/know-your-rights";
import SafetyTips from "@/pages/safety-tips";
import Transparency from "@/pages/transparency";
import NotFound from "./pages/not-found";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";

function AuthenticatedRouter() {
  const { isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="app-background">
        <div className="min-h-screen flex items-center justify-center animate-in fade-in duration-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-background">
      <div key={location} className="animate-in fade-in duration-300">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/discover" component={Discover} />
          <Route path="/resources" component={Resources} />
          <Route path="/saved" component={Saved} />
          <Route path="/profile" component={Profile} />
          <Route path="/protest/:id" component={ProtestDetail} />
          <Route path="/filter" component={Filter} />
          <Route path="/theme-settings" component={ThemeSettings} />

          <Route path="/know-your-rights" component={KnowYourRights} />
          <Route path="/safety-tips" component={SafetyTips} />
          <Route path="/create-protest" component={CreateProtest} />
          <Route path="/transparency" component={Transparency} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function AppRouter() {
  const [location] = useLocation();

  return (
    <div className="app-background">
      <div key={location} className="animate-in fade-in duration-300">
        <Switch>
          <Route path="/sign-in" component={SignIn} />
          <Route path="/*">
            <AuthenticatedRouter />
          </Route>
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <AppRouter />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;