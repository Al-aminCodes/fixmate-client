"use client";

import { useSession } from "@/lib/auth-client";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  Loader2,
  RefreshCw,
  Search,
  Wrench,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";

type Booking = {
  _id: string;
  serviceTitle: string;
  serviceImage?: string;
  category?: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  preferredDate: string;
  status: BookingStatus;
  paymentStatus: "paid" | "unpaid";
  basePrice: number;
  finalAmount?: number;
  createdAt: string;
};

const statusOptions = [
  "all",
  "requested",
  "accepted",
  "in-progress",
  "completed",
  "rejected",
  "cancelled",
];

export default function AdminBookingsPage() {
  const { data: session } = useSession();
  const token = session?.session.token;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/admin/bookings`, {
        credentials: "include",
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      setError("");

      if (!response.ok) {
        throw new Error("Failed to fetch bookings.");
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Admin bookings error:", err);
      setError("Unable to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchBookings();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchBookings]);

  const handleRefresh = () => {
    setLoading(true);
    fetchBookings();
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        booking.serviceTitle?.toLowerCase().includes(searchValue) ||
        booking.customerName?.toLowerCase().includes(searchValue) ||
        booking.customerEmail?.toLowerCase().includes(searchValue) ||
        booking.technicianName?.toLowerCase().includes(searchValue) ||
        booking.technicianEmail?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const requestedCount = bookings.filter(
    (booking) => booking.status === "requested",
  ).length;

  const activeCount = bookings.filter((booking) =>
    ["accepted", "in-progress"].includes(booking.status),
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;

  const cancelledCount = bookings.filter(
    (booking) => booking.status === "cancelled",
  ).length;

  const getStatusStyle = (status: BookingStatus) => {
    const styles: Record<BookingStatus, string> = {
      requested: "bg-yellow-500/10 text-yellow-600",
      accepted: "bg-blue-500/10 text-blue-600",
      rejected: "bg-red-500/10 text-red-600",
      "in-progress": "bg-purple-500/10 text-purple-600",
      completed: "bg-green-500/10 text-green-600",
      cancelled: "bg-red-500/10 text-red-600",
    };

    return styles[status];
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-muted-foreground">Administration</p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            All Bookings
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Monitor all repair bookings across the FixMate platform.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Bookings"
          value={bookings.length}
          icon={<ClipboardList className="h-5 w-5" />}
        />

        <StatCard
          title="Requested"
          value={requestedCount}
          icon={<Clock className="h-5 w-5" />}
        />

        <StatCard
          title="Active"
          value={activeCount}
          icon={<Wrench className="h-5 w-5" />}
        />

        <StatCard
          title="Completed"
          value={completedCount}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <StatCard
          title="Cancelled"
          value={cancelledCount}
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      {/* Booking Table */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold">Platform Bookings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search bookings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "all"
                    ? "All Statuses"
                    : status
                        .replace("-", " ")
                        .replace(/^\w/, (char) => char.toUpperCase())}
                </option>
              ))}
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
        ) : filteredBookings.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="font-semibold">No bookings found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead className="border-b border-border bg-muted/40">
                <tr className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Technician</th>
                  <th className="px-5 py-4">Booking Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Amount</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="transition hover:bg-muted/30"
                  >
                    {/* Service */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {booking.serviceImage ? (
                          <img
                            src={booking.serviceImage}
                            alt={booking.serviceTitle}
                            className="h-11 w-11 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
                            <Wrench className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}

                        <div>
                          <p className="font-medium">{booking.serviceTitle}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {booking.category || "Repair Service"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">
                        {booking.customerName}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {booking.customerEmail}
                      </p>
                    </td>

                    {/* Technician */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">
                        {booking.technicianName}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {booking.technicianEmail}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {booking.preferredDate
                        ? new Date(booking.preferredDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "N/A"}
                    </td>

                    {/* Booking Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(
                          booking.status,
                        )}`}
                      >
                        {booking.status.replace("-", " ")}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                          booking.paymentStatus === "paid"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-yellow-500/10 text-yellow-600"
                        }`}
                      >
                        <CreditCard className="h-3 w-3" />
                        {booking.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 text-sm font-semibold">
                      ৳
                      {Number(
                        booking.finalAmount ?? booking.basePrice ?? 0,
                      ).toLocaleString("en-BD")}
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
