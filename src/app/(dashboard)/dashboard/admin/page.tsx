"use client";

import { useSession } from "@/lib/auth-client";
import {
  AlertCircle,
  ArrowRight,
  ClipboardList,
  Clock,
  CreditCard,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type DashboardStats = {
  totalUsers: number;
  totalTechnicians: number;
  pendingServices: number;
};

const initialStats: DashboardStats = {
  totalUsers: 0,
  totalTechnicians: 0,
  pendingServices: 0,
};

export default function AdminOverviewPage() {
  const { data: session, isPending } = useSession();

  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = session?.session.token;

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/admin/overview`, {
        credentials: "include",
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load dashboard.");
      }

      setStats(data.stats);
    } catch (err) {
      console.error("Admin overview error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard information.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;

    const timeoutId = window.setTimeout(() => {
      if (session?.user) {
        fetchOverview();
      } else {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [session, isPending, fetchOverview]);

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-muted-foreground">Administration</p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {session?.user?.name || "Admin"}!
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across your FixMate platform.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>

          <button
            onClick={fetchOverview}
            className="shrink-0 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Platform Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A quick summary of your platform activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            description="All registered platform users"
            icon={<Users className="h-6 w-6" />}
          />

          <StatCard
            title="Total Technicians"
            value={stats.totalTechnicians}
            description="Registered technician accounts"
            icon={<Wrench className="h-6 w-6" />}
          />

          <StatCard
            title="Pending Services"
            value={stats.pendingServices}
            description="Services waiting for approval"
            icon={<Clock className="h-6 w-6" />}
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage different areas of your platform.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            href="/dashboard/admin/users"
            title="Manage Users"
            description="View users and manage account roles."
            icon={<UserRound className="h-6 w-6" />}
          />

          <QuickAction
            href="/dashboard/admin/services"
            title="Manage Services"
            description="Review and approve technician services."
            icon={<Wrench className="h-6 w-6" />}
          />

          <QuickAction
            href="/dashboard/admin/bookings"
            title="All Bookings"
            description="Monitor repair bookings across FixMate."
            icon={<ClipboardList className="h-6 w-6" />}
          />

          <QuickAction
            href="/dashboard/admin/transactions"
            title="Transactions"
            description="Monitor successful payments and revenue."
            icon={<CreditCard className="h-6 w-6" />}
          />
        </div>
      </section>

      {/* Admin Information */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>

        <div>
          <h3 className="font-semibold">Platform Administration</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage user accounts, review service listings, monitor bookings, and
            keep track of platform transactions.
          </p>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition hover:border-primary/40">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>

        <div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
      </div>

      <p className="mt-4 text-3xl font-bold">{value.toLocaleString()}</p>

      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>

        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
