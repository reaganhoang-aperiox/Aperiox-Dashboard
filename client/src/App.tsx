import { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import LivePositions from "@/components/LivePositions";
import TradingLog from "@/components/TradingLog";
import { Sidebar } from "@/components/Sidebar";
import { LoginForm } from "@/components/LoginForm";
import { SignupForm } from "@/components/SignupForm";
import { AdminPanel } from "@/components/AdminPanel";
import { authService } from "@/services/auth";

type View = "Control Center" | "Live Positions" | "Trading Log" | "Admin Panel";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>("Control Center");
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setIsLoading(false);

    // Set up global handler for signup link
    (window as any).onShowSignup = () => setShowSignup(true);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowSignup(false);
  };

  const handleSignupSuccess = () => {
    setShowSignup(false);
    alert(
      "Account created successfully, please wait for admin approval before logging in."
    );
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentView("Control Center");
    setShowSignup(false);
  };

  const renderView = () => {
    switch (currentView) {
      case "Control Center":
        return <Dashboard />;
      case "Live Positions":
        return <LivePositions />;
      case "Trading Log":
        return <TradingLog />;
      case "Admin Panel":
        return <AdminPanel />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light-alt/40">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <img
              src="/favicon.png"
              alt="Logo"
              className="h-32 w-auto animate-pulse"
            />
          </div>
          <div className="text-brand-gray">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showSignup) {
      return (
        <SignupForm
          onSignupSuccess={handleSignupSuccess}
          onBackToLogin={() => setShowSignup(false)}
        />
      );
    }
    return (
      <LoginForm
        onLoginSuccess={handleLoginSuccess}
        onShowSignup={() => setShowSignup(true)}
      />
    );
  }

  const user = authService.getUser();
  const isAdmin = user?.isAdmin === true;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        userName={user?.username || "@investor"}
        userEmail={user?.email || "investor@example.com"}
        userAccountId={user?.accountId}
        onLogout={handleLogout}
        currentView={currentView}
        onViewChange={setCurrentView}
        isAdmin={isAdmin}
      />
      <div className="flex-1 overflow-y-auto">{renderView()}</div>
    </div>
  );
}

export default App;
