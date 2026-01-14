const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  accountId: string;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    isAdmin?: boolean;
    isApproved?: boolean;
  };
}

class AuthService {
  private readonly TOKEN_KEY = "trading_auth_token";
  private readonly USER_KEY = "trading_user";

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data: AuthResponse = await response.json();

      // Store token and user info
      this.setToken(data.token);
      this.setUser(data.user);

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getUser(): any | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
