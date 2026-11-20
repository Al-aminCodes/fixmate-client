"use client";

import { useSession } from "@/lib/auth-client";
import { useCallback, useEffect, useState } from "react";

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
  paymentStatus: "paid";
  paidAt: string;
};

const formatAmount = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export default function CustomerPaymentsPage() {
  const { data: session, isPending: sessionLoading } = useSession();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = session?.user;
  const token = session?.session.token;

  const fetchPayments = useCallback(async () => {
    if (!user?.email) return;

    try {
      const response = await fetch(`${API_URL}/customer/payments`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setError("");

      if (!response.ok) {
        throw new Error(data.message || "Failed to load payment history");
      }

      setPayments(data.payments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (sessionLoading) return;

    if (!user?.email) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetchPayments();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [sessionLoading, user?.email, fetchPayments]);

  if (sessionLoading || (loading && !!user?.email)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading payment history...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <h2 className="text-xl font-semibold">Please sign in</h2>
        <p className="mt-2 text-muted-foreground">
          Sign in to view your payment history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View all your completed payments and transactions.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Payments</p>
          <h2 className="mt-2 text-3xl font-bold">{payments.length}</h2>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Paid (USD)</p>
          <h2 className="mt-2 text-3xl font-bold">
            {formatAmount(
              payments.reduce(
                (total, payment) => total + Number(payment.amount || 0),
                0,
              ),
              "usd",
            )}
          </h2>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            onClick={fetchPayments}
            className="ml-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Payment Table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b p-5">
          <h2 className="font-semibold">Transaction Records</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your successful payment transactions.
          </p>
        </div>

        {payments.length === 0 && !error ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-2xl">
              $
            </div>
            <h3 className="font-semibold">No payments yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your completed payments will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Service</th>
                    <th className="px-5 py-4 font-medium">Technician</th>
                    <th className="px-5 py-4 font-medium">Amount</th>
                    <th className="px-5 py-4 font-medium">Transaction ID</th>
                    <th className="px-5 py-4 font-medium">Payment Date</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-4 font-medium">
                        {payment.serviceTitle}
                      </td>

                      <td className="px-5 py-4">{payment.technicianName}</td>

                      <td className="px-5 py-4 font-semibold">
                        {formatAmount(payment.amount, payment.currency)}
                      </td>

                      <td className="max-w-[180px] px-5 py-4">
                        <span
                          title={payment.transactionId}
                          className="block truncate font-mono text-xs text-muted-foreground"
                        >
                          {payment.transactionId}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {formatDate(payment.paidAt)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y md:hidden">
              {payments.map((payment) => (
                <div key={payment._id} className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{payment.serviceTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        Technician: {payment.technicianName}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Paid
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">
                      {formatAmount(payment.amount, payment.currency)}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">Transaction ID</p>
                    <p className="break-all font-mono text-xs">
                      {payment.transactionId}
                    </p>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Date</span>
                    <span>{formatDate(payment.paidAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
