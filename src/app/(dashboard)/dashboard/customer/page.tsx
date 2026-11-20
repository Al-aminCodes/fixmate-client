"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  ArrowRight,
  Wrench,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Booking = {
  _id: string;
  serviceTitle: string;
  serviceImage?: string;
  category: string;
  basePrice: number;
  finalAmount?: number;
  status:
    | "requested"
    | "accepted"
    | "rejected"
    | "in-progress"
    | "completed"
    | "cancelled";
  paymentStatus: "unpaid" | "paid";
  preferredDate: string;
  createdAt: string;
  technicianName: string;
};

type Payment = {
  _id: string;
  amount: number;
  paymentStatus: string;
};

export default function CustomerOverviewPage() {
  const { data: session } = useSession();
  const token = session?.session.token;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError("");

        const [bookingRes, paymentRes] = await Promise.all([
          fetch(`${API_URL}/customer/bookings`, {
            credentials: "include",
            headers: {
              authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/customer/payments`, {
            credentials: "include",
            headers: {
              authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!bookingRes.ok || !paymentRes.ok) {
          throw new Error("Failed to load dashboard information.");
        }

        const bookingData = await bookingRes.json();
        const paymentData = await paymentRes.json();

        setBookings(bookingData.bookings || []);
        setPayments(paymentData.payments || []);
      } catch (err) {
        console.error("Customer overview error:", err);
        setError("Unable to load your dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const activeBookings = bookings.filter((booking) =>
    ["requested", "accepted", "in-progress"].includes(booking.status),
  );

  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed",
  );

  const totalPaid = payments
    .filter((payment) => payment.paymentStatus === "paid")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const getStatusStyle = (status: Booking["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-600";
      case "accepted":
        return "bg-blue-500/10 text-blue-600";
      case "in-progress":
        return "bg-purple-500/10 text-purple-600";
      case "rejected":
      case "cancelled":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-yellow-500/10 text-yellow-600";
    }
  };

  if (loading) {
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
          <p className="text-sm text-muted-foreground">Customer Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {session?.user?.name || "Customer"}!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Here&apos;s an overview of your repair activities.
          </p>
        </div>

        <Link
          href="/services"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Wrench className="h-4 w-4" />
          Find a Service
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={bookings.length}
          description="All your repair requests"
          icon={<CalendarDays className="h-5 w-5" />}
        />

        <StatCard
          title="Active Bookings"
          value={activeBookings.length}
          description="Currently in progress"
          icon={<Clock className="h-5 w-5" />}
        />

        <StatCard
          title="Completed"
          value={completedBookings.length}
          description="Successfully completed"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <StatCard
          title="Total Paid"
          value={`$${totalPaid.toFixed(2)}`}
          description="Your successful payments"
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <QuickAction
            href="/dashboard/customer/bookings"
            title="My Bookings"
            description="Track and manage your repair requests."
            icon={<CalendarDays className="h-6 w-6" />}
          />

          <QuickAction
            href="/dashboard/customer/payments"
            title="Payment History"
            description="View your completed transactions."
            icon={<CreditCard className="h-6 w-6" />}
          />
        </div>
      </section>

      {/* Recent Bookings */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="font-semibold">Recent Bookings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your latest repair requests
            </p>
          </div>

          <Link
            href="/dashboard/customer/bookings"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Wrench className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="font-semibold">No bookings yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Find a repair service and book your first appointment.
            </p>
            <Link
              href="/services"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Explore Services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentBookings.map((booking) => (
              <div
                key={booking._id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  {booking.serviceImage ? (
                    <img
                      src={booking.serviceImage}
                      alt={booking.serviceTitle}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <Wrench className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium">{booking.serviceTitle}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {booking.category} · {booking.technicianName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(booking.preferredDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(booking.status)}`}
                  >
                    {booking.status.replace("-", " ")}
                  </span>

                  <span className="text-sm font-semibold">
                    ৳
                    {Number(
                      booking.finalAmount ?? booking.basePrice,
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
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
  value: string | number;
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
      className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
