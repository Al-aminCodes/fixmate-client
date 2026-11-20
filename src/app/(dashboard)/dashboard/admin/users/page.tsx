"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  Users,
  ShieldCheck,
  UserRound,
  Wrench,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type UserRole = "customer" | "technician" | "admin";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  createdAt: string;
};

const roles: UserRole[] = ["customer", "technician", "admin"];

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const token = session?.session.token;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [error, setError] = useState("");

  const currentUserId = session?.user?.id;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/admin/users`, {
        credentials: "include",
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to fetch users.");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Fetch users error:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      void Promise.resolve().then(() => fetchUsers());
    }
  }, [session?.user, fetchUsers]);

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    if (user.id === currentUserId) {
      toast.error("You cannot change your own role.");
      return;
    }

    if (user.role === newRole) return;

    const confirmed = window.confirm(
      `Are you sure you want to change ${user.name}'s role from ${user.role} to ${newRole}?`,
    );

    if (!confirmed) return;

    try {
      setUpdatingId(user.id);

      const response = await fetch(
        `${API_URL}/admin/users/${encodeURIComponent(user.id)}/role`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",

            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user role.");
      }

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === user.id ? { ...item, role: newRole } : item,
        ),
      );

      toast.success(`User role updated to ${newRole}.`);
    } catch (error) {
      console.error("Update role error:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const customerCount = users.filter((user) => user.role === "customer").length;

  const technicianCount = users.filter(
    (user) => user.role === "technician",
  ).length;

  const adminCount = users.filter((user) => user.role === "admin").length;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-muted-foreground">Administration</p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Manage Users
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            View registered users and manage their account roles.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={<Users className="h-5 w-5" />}
        />

        <StatCard
          title="Customers"
          value={customerCount}
          icon={<UserRound className="h-5 w-5" />}
        />

        <StatCard
          title="Technicians"
          value={technicianCount}
          icon={<Wrench className="h-5 w-5" />}
        />

        <StatCard
          title="Admins"
          value={adminCount}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div>

      {/* Users Table */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">All Users</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredUsers.length} users found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary sm:w-64"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="technician">Technician</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="m-5 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="font-semibold">No users found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing your search or role filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b border-border bg-muted/40">
                <tr className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Joined Date</th>
                  <th className="px-5 py-4">Manage Role</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => {
                  const isCurrentUser = user.id === currentUserId;

                  return (
                    <tr key={user.id} className="transition hover:bg-muted/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name}
                              width={40}
                              height={40}
                              unoptimized
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                          )}

                          <div>
                            <p className="font-medium">
                              {user.name || "Unknown"}
                            </p>

                            {isCurrentUser && (
                              <span className="text-xs text-primary">You</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {user.email}
                      </td>

                      <td className="px-5 py-4">
                        <RoleBadge role={user.role} />
                      </td>

                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "N/A"}
                      </td>

                      <td className="px-5 py-4">
                        {isCurrentUser ? (
                          <span className="text-xs text-muted-foreground">
                            Your account
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              value={user.role}
                              disabled={updatingId === user.id}
                              onChange={(e) =>
                                handleRoleChange(
                                  user,
                                  e.target.value as UserRole,
                                )
                              }
                              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
                            >
                              {roles.map((role) => (
                                <option key={role} value={role}>
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                              ))}
                            </select>

                            {updatingId === user.id && (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>

        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      </div>

      <p className="mt-4 text-2xl font-bold">{value}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    customer: "bg-blue-500/10 text-blue-600",
    technician: "bg-purple-500/10 text-purple-600",
    admin: "bg-orange-500/10 text-orange-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${styles[role]}`}
    >
      {role}
    </span>
  );
}
