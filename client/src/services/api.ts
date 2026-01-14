import { authService } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface Deal {
  id: string;
  platform: string;
  type: string;
  time: string;
  commission: number;
  swap: number;
  profit: number;
  symbol?: string;
  entryType?: string;
  volume?: number;
  price?: number;
}

export interface Position {
  id: string;
  platform: string;
  type: string;
  symbol: string;
  openPrice: number;
  volume: number;
  profit: number;
  unrealizedProfit: number;
  commission: number;
  time: string;
}

export interface AccountInfo {
  account: {
    name: string;
    login: string;
    broker?: string;
    server?: string;
    currency?: string;
    platform?: string;
    region?: string;
  };
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  leverage: number;
  positions: Position[];
  orders?: any[];
}

export interface WebhookResponse extends AccountInfo {
  deals: Deal[];
}

// Helper function to make authenticated API calls
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = authService.getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    // Token expired or invalid
    authService.logout();
    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  const result = await response.json();
  
  // Handle response structure: {success: true, data: ...}
  if (result.success !== undefined && result.data !== undefined) {
    return result.data;
  }
  
  // Fallback to data property or result itself
  return result.data || result;
};

// Fetch account information
export const fetchAccountInfo = async (): Promise<AccountInfo> => {
  return await fetchWithAuth("/api/account/info");
};

// Fetch open positions
export const fetchPositions = async (): Promise<Position[]> => {
  return await fetchWithAuth("/api/account/positions");
};

// Fetch deal history
export const fetchDeals = async (
  startTime?: number,
  endTime?: number,
  year?: number
): Promise<Deal[]> => {
  const params = new URLSearchParams();
  if (startTime) params.append("startTime", startTime.toString());
  if (endTime) params.append("endTime", endTime.toString());
  if (year) params.append("year", year.toString());

  const queryString = params.toString();
  const endpoint = `/api/account/deals${queryString ? `?${queryString}` : ""}`;

  const result = await fetchWithAuth(endpoint);
  
  // Handle different response structures
  if (Array.isArray(result)) {
    return result;
  }
  // If result is an object with deals property
  if (result && typeof result === 'object' && 'deals' in result && Array.isArray(result.deals)) {
    return result.deals;
  }
  // Fallback to empty array
  return [];
};

// Fetch complete trading data (account + deals)
export const fetchTradingData = async (year?: number): Promise<WebhookResponse> => {
  try {
    // Fetch account info and deals in parallel
    // Fetch deals for the current year by default, or specified year
    const currentYear = year || new Date().getFullYear();
    const [accountInfo, deals] = await Promise.all([
      fetchAccountInfo(),
      fetchDeals(undefined, undefined, currentYear),
    ]);

    // Ensure deals is always an array
    const dealsArray = Array.isArray(deals) ? deals : [];

    return {
      ...accountInfo,
      deals: dealsArray,
    };
  } catch (error) {
    console.error("Error fetching trading data:", error);
    throw error;
  }
};
