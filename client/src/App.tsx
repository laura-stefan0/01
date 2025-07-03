
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Main page imports
import HomePage from "./pages/home";
import DiscoverPage from "./pages/discover";
import SavedPage from "./pages/saved";
import ResourcesPage from "./pages/resources";
import ProfilePage from "./pages/profile";

// Profile nested page imports
import ProfileSettingsPage from "./pages/profile/settings";
import ProfileMorePage from "./pages/profile/more";
import ProfileThemeSettingsPage from "./pages/profile/settings/theme";
import SavedProtestsPage from "./pages/profile/saved";
import ArchivedProtestsPage from "./pages/profile/archived";

// Other pages
import SignIn from "./pages/sign-in";
import CreateProtest from "@/pages/create-protest";
import ProtestDetail from "@/pages/protest-detail";
import Filter from "@/pages/filter";
import ThemeSettings from "@/pages/theme-settings";
import KnowYourRights from "@/pages/know-your-rights";
import SafetyTips from "@/pages/safety-tips";
import Transparency from "@/pages/transparency";
import NotificationsPage from "@/pages/notifications";
import NotFound from "./pages/not-found";

// Context and components
import { AuthProvider, useAuth } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import { Navbar } from "@/components/navbar";
import { SavedProtestsProvider } from "@/context/saved-protests-context";
import LiveProtestModePage from "./pages/live-protest-mode";
import { LoadingScreen } from "@/components/loading-screen";

/**
 * Layout component that conditionally shows navbar
 * Navbar appears on first-level routes but not on nested subpages
 */
function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Define routes where navbar should NOT appear
  const hideNavbarRoutes = [
    '/sign-in',
    '/profile/settings',
    '/profile/settings/theme',
    '/profile/more',
    '/profile/saved',
    '/profile/archived',
    '/theme-settings',
    '/create-protest',
    '/know-your-rights',
    '/safety-tips',
    '/transparency',
    '/filter',
    '/notifications',
    '/live-protest-mode'
  ];

  // Check if current route starts with any pattern that should hide navbar
  const shouldHideNavbar = hideNavbarRoutes.some(route => 
    location.pathname === route || 
    location.pathname.startsWith('/protest/') // Hide on protest detail pages
  );

  return (
    <div className="app-background">
      <div className="animate-in fade-in duration-500 ease-out min-h-screen">
        <div className="transition-all duration-300 ease-in-out">
          {children}
        </div>
        {/* Show navbar only on main routes */}
        {!shouldHideNavbar && <Navbar />}
        {/* Add bottom padding when navbar is visible - matches navbar height */}
        {!shouldHideNavbar && <div className="h-16" />}
      </div>
    </div>
  );
}

/**
 * Authenticated router component
 * Handles routes for authenticated users with loading state
 */
function AuthenticatedRouter() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AppLayout>
      <Routes>
        {/* Main navigation routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/resources" element={<ResourcesPage />} />

        {/* Profile with nested routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/settings" element={<ProfileSettingsPage />} />
        <Route path="/profile/settings/theme" element={<ProfileThemeSettingsPage />} />
        <Route path="/profile/more" element={<ProfileMorePage />} />
        <Route path="/profile/saved" element={<SavedProtestsPage />} />
        <Route path="/profile/archived" element={<ArchivedProtestsPage />} />

        {/* Other pages */}
        <Route path="/protest/:id" element={<ProtestDetail />} />
        <Route path="/filter" element={<Filter />} />
        <Route path="/theme-settings" element={<ThemeSettings />} />
        <Route path="/know-your-rights" element={<KnowYourRights />} />
        <Route path="/safety-tips" element={<SafetyTips />} />
        <Route path="/create-protest" element={<CreateProtest />} />
        <Route path="/transparency" element={<Transparency />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/live-protest-mode" element={<LiveProtestModePage />} />

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

/**
 * Main app router component
 * Handles authentication routing between sign-in and main app
 */
function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/sign-in" element={
          <div className="app-background">
            <div className="animate-in fade-in duration-500 ease-out">
              <SignIn />
            </div>
          </div>
        } />
        <Route path="/*" element={<AuthenticatedRouter />} />
      </Routes>
    </Router>
  );
}

/**
 * Root App component
 * Sets up all providers and global state management
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <SavedProtestsProvider>
            <TooltipProvider>
              <Toaster />
              <AppRouter />
            </TooltipProvider>
          </SavedProtestsProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;