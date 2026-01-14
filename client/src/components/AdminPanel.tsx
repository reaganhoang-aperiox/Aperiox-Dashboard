import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth";
import { Check, X, RefreshCw, Settings } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isApproved: boolean;
  createdAt: string;
  accountId?: string;
}

interface PendingUser {
  id: number;
  username: string;
  email: string;
  name: string;
  accountId?: string;
  createdAt: string;
}

export const AdminPanel = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ accountId: "" });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const fetchPendingUsers = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/auth/pending-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch pending users");

      const data = await response.json();
      setPendingUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching pending users:", err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setAllUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchPendingUsers(), fetchAllUsers()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleApprove = async (userId: number) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/auth/approve-user/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to approve user");
      }

      await Promise.all([fetchPendingUsers(), fetchAllUsers()]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve user");
    }
  };

  const handleReject = async (userId: number) => {
    if (!confirm("Are you sure you want to reject and delete this user?")) {
      return;
    }

    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/auth/reject-user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to reject user");
      }

      await Promise.all([fetchPendingUsers(), fetchAllUsers()]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject user");
    }
  };

  const handleUpdateUser = async (userId: number) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/auth/update-user/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update user");
      }

      setEditingUser(null);
      setEditForm({ accountId: "" });
      await fetchAllUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 md:px-10 bg-brand-light-alt/40 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <img
              src="/favicon.png"
              alt="Logo"
              className="h-32 w-auto animate-pulse"
            />
          </div>
          <div className="text-brand-gray">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-10 bg-brand-light-alt/40">
      <div className="mx-auto space-y-6 max-w-7xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Admin Panel
          </h1>
          <p className="text-brand-gray mt-1">Manage users and approvals</p>
        </div>

        {error && (
          <Card className="bg-destructive/10 border-destructive/50">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals ({pendingUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingUsers.length === 0 ? (
              <p className="text-brand-gray">No pending approvals</p>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-brand-gray">
                        {user.username} • {user.email}
                      </div>
                      {user.accountId && (
                        <div className="text-xs text-brand-gray mt-1">
                          Account ID: {user.accountId}
                        </div>
                      )}
                      <div className="text-xs text-brand-gray">
                        Signed up: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(user.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(user.id)}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Users ({allUsers.length})</CardTitle>
              <Button onClick={() => Promise.all([fetchPendingUsers(), fetchAllUsers()])} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray">
                      Username
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray">
                      Account ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border/50 hover:bg-card/50"
                    >
                      <td className="py-4 px-4">
                        <div className="font-semibold">{user.name}</div>
                        {user.isAdmin && (
                          <span className="text-xs text-brand-light">Admin</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-brand-gray">{user.username}</td>
                      <td className="py-4 px-4 text-brand-gray">{user.email}</td>
                      <td className="py-4 px-4">
                        {user.isApproved ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs">
                            Approved
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {editingUser === user.id ? (
                          <input
                            type="text"
                            value={editForm.accountId}
                            onChange={(e) =>
                              setEditForm({ ...editForm, accountId: e.target.value })
                            }
                            placeholder="Account ID"
                            className="px-2 py-1 border border-border rounded text-sm"
                          />
                        ) : (
                          <span className="text-brand-gray text-sm">
                            {user.accountId || "Not set"}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {editingUser === user.id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateUser(user.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                            onClick={() => {
                              setEditingUser(null);
                              setEditForm({ accountId: "" });
                            }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUser(user.id);
                              setEditForm({
                                accountId: user.accountId || "",
                              });
                            }}
                          >
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

