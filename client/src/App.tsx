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
    '/theme-settings',
    '/create-protest',
    '/know-your-rights',
    '/safety-tips',
    '/transparency',
    '/filter',
    '/notifications'
  ];

  // Check if current route starts with any pattern that should hide navbar
  const shouldHideNavbar = hideNavbarRoutes.some(route => 
    location.pathname === route || 
    location.pathname.startsWith('/protest/') // Hide on protest detail pages
  );

  return (
    <div className="app-background">
      <div className="animate-in fade-in duration-300 min-h-screen">
        {children}
        {/* Show navbar only on main routes */}
        {!shouldHideNavbar && <Navbar />}
        {/* Add bottom padding when navbar is visible */}
        {!shouldHideNavbar && <div className="h-20" />}
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

        {/* Other pages */}
        <Route path="/protest/:id" element={<ProtestDetail />} />
        <Route path="/filter" element={<Filter />} />
        <Route path="/theme-settings" element={<ThemeSettings />} />
        <Route path="/know-your-rights" element={<KnowYourRights />} />
        <Route path="/safety-tips" element={<SafetyTips />} />
        <Route path="/create-protest" element={<CreateProtest />} />
        <Route path="/transparency" element={<Transparency />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        
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
            <div className="animate-in fade-in duration-300">
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