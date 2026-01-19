import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SignupFormProps {
  onSignupSuccess: () => void;
  onBackToLogin: () => void;
}

export const SignupForm = ({
  onSignupSuccess,
  onBackToLogin,
}: SignupFormProps) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    server: "",
    accountNumber: "",
    investorPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (
      !formData.server ||
      !formData.accountNumber ||
      !formData.investorPassword
    ) {
      setError(
        "Broker server, account number, and investor password are required",
      );
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name || formData.username,
          server: formData.server,
          accountNumber: formData.accountNumber,
          investorPassword: formData.investorPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      onSignupSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light-alt/40 p-4">
      <Card className="w-full max-w-3xl bg-card shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <img src="/images/logo.svg" alt="Logo" className="h-12 w-auto" />
          </div>
          <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
          <CardDescription className="text-brand-gray">
            Sign up to access the trading dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username *
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light transition-colors"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="server" className="text-sm font-medium">
                  Broker Server Name *
                </label>
                <input
                  id="server"
                  type="text"
                  placeholder="e.g. VTMARKETS-LIVE 9"
                  value={formData.server}
                  onChange={(e) =>
                    setFormData({ ...formData, server: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light transition-colors"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="accountNumber" className="text-sm font-medium">
                  Account Number *
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  placeholder="MT4/MT5 Account Number"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light transition-colors"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="investorPassword"
                  className="text-sm font-medium"
                >
                  Investor Password *
                </label>
                <input
                  id="investorPassword"
                  type="password"
                  placeholder="Investor (read-only) Password"
                  value={formData.investorPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      investorPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand-light transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <div className="text-xs font-medium text-brand-gray mb-2">
              Disclaimer: You can retrieve this in your email inbox after
              signing up.
            </div>
            <Button
              type="submit"
              className="w-full bg-brand-light hover:bg-brand-dark text-white font-semibold py-3 rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="text-center text-sm text-brand-gray">
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-brand-light hover:underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
