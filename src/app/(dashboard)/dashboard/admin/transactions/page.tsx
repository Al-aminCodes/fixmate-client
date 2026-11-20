"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  CreditCard,
  DollarSign,
  TrendingUp,
  CalendarDays,
  Loader2,
  AlertCircle,
  RefreshCw,
  Receipt,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Payment = {
  _id: string;
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: "paid" | "unpaid" | "failed";
  paidAt: string;
};

export default function AdminTransactionsPage() {
  const { data: session } = useSession();
  const token = session?.session.token;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/admin/payments`, {
        credentials: "include",
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions.");
      }

      const data = await response.json();
      setPayments(data.payments || []);
    } catch (err) {
      console.error("Admin transactions error:", err);
      setError("Unable to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchPayments();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchPayments]);

  // Only successful payments count as revenue.
  const successfulPayments = useMemo(
    () => payments.filter((payment) => payment.paymentStatus === "paid"),
    [payments],
  );

  const totalRevenue = successfulPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );

  const filteredPayments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return payments;

    return payments.filter((payment) => {
      return (
        payment.customerName?.toLowerCase().includes(searchValue) ||
        payment.customerEmail?.toLowerCase().includes(searchValue) ||
        payment.technicianName?.toLowerCase().includes(searchValue) ||
        payment.technicianEmail?.toLowerCase().includes(searchValue) ||
        payment.serviceTitle?.toLowerCase().includes(searchValue) ||
        payment.transactionId?.toLowerCase().includes(searchValue)
      );
    });
  }, [payments, search]);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (currency || "USD").toUpperCase(),
    }).format(Number(amount || 0));
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-muted-foreground">Administration</p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Transactions
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Monitor payments and revenue across the FixMate platform.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Revenue Summary */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                {formatAmount(totalRevenue, "USD")}
              </h2>
            </div>

            <div className="rounded-xl bg-green-500/10 p-3 text-green-600">
              <DollarSign className="h-7 w-7" />
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            From {successfulPayments.length} successful payments
          </p>
        </div>

        <StatCard
          title="Total Transactions"
          value={payments.length}
          description="All payment records"
          icon={<Receipt className="h-5 w-5" />}
        />

        <StatCard
          title="Successful Payments"
          value={successfulPayments.length}
          description="Verified paid transactions"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </section>

      {/* Transactions Table */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">All Transactions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing {filteredPayments.length} of {payments.length} records
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary sm:w-72"
            />
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
        ) : filteredPayments.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <CreditCard className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="font-semibold">No transactions found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Payment records will appear here after successful payments.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b border-border bg-muted/40">
                <tr className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Technician</th>
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Transaction ID</th>
                  <th className="px-5 py-4">Payment Date</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="transition hover:bg-muted/30"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">
                        {payment.customerName || "Unknown"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {payment.customerEmail}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">
                        {payment.technicianName || "Unknown"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {payment.technicianEmail}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium">
                      {payment.serviceTitle || "Repair Service"}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold">
                      {formatAmount(payment.amount, payment.currency)}
                    </td>

                    <td className="max-w-56 px-5 py-4">
                      <p
                        className="truncate font-mono text-xs text-muted-foreground"
                        title={payment.transactionId}
                      >
                        {payment.transactionId || "N/A"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4 shrink-0" />
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "N/A"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          payment.paymentStatus === "paid"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-yellow-500/10 text-yellow-600"
                        }`}
                      >
                        {payment.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
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
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>

        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      </div>

      <p className="mt-4 text-2xl font-bold">{value}</p>

      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
