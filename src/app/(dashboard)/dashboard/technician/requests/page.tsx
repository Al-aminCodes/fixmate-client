"use client";

import { useSession } from "@/lib/auth-client";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  Phone,
  User,
  Wrench,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed";

type Booking = {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  category: string;
  basePrice: number;
  technicianName: string;
  technicianEmail: string;
  technicianPhoto: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: BookingStatus;
  paymentStatus: "unpaid" | "paid";
  finalAmount?: number;
  createdAt: string;
};

export default function TechnicianRequestsPage() {
  const { data: session, isPending } = useSession();

  const user = session?.user;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [finalAmounts, setFinalAmounts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user?.email || user.role !== "technician" || !API_URL) return;

    let cancelled = false;

    const loadBookings = async () => {
      try {
        const response = await fetch(
          `${API_URL}/bookings?technicianEmail=${encodeURIComponent(user.email)}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch booking requests.");
        }

        const data = await response.json();
        if (!cancelled) setBookings(data.bookings || []);
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          toast.error("Could not load booking requests.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, [user?.email, user?.role]);

  const updateBookingStatus = async (
    booking: Booking,
    status: BookingStatus,
  ) => {
    let finalAmount: number | undefined;

    if (status === "completed") {
      const amount = Number(finalAmounts[booking._id]);

      if (
        !finalAmounts[booking._id] ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        toast.error("Enter a valid final amount greater than 0.");
        return;
      }

      finalAmount = amount;
    }

    const confirmed = window.confirm(
      `Are you sure you want to change this booking to ${status}?`,
    );

    if (!confirmed) return;

    try {
      setUpdatingId(booking._id);

      const response = await fetch(
        `${API_URL}/bookings/${booking._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            ...(finalAmount !== undefined && { finalAmount }),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update booking.");
      }

      toast.success(data.message || "Booking updated successfully.");

      setBookings((previous) =>
        previous.map((item) =>
          item._id === booking._id
            ? {
                ...item,
                status,
                ...(finalAmount !== undefined && { finalAmount }),
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case "requested":
        return "bg-yellow-500/10 text-yellow-600";
      case "accepted":
        return "bg-blue-500/10 text-blue-600";
      case "rejected":
        return "bg-red-500/10 text-red-600";
      case "in-progress":
        return "bg-purple-500/10 text-purple-600";
      case "completed":
        return "bg-green-500/10 text-green-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={35} />
      </div>
    );
  }

  if (!user || user.role !== "technician") {
    return (
      <div className="rounded-xl border p-10 text-center">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">
          Only technicians can access booking requests.
        </p>
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Booking Requests</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage customer requests and update repair progress.
        </p>
      </div>

      {/* Booking count */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total",
            value: bookings.length,
          },
          {
            label: "Requested",
            value: bookings.filter((b) => b.status === "requested").length,
          },
          {
            label: "In Progress",
            value: bookings.filter((b) => b.status === "in-progress").length,
          },
          {
            label: "Completed",
            value: bookings.filter((b) => b.status === "completed").length,
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <h2 className="mt-2 text-2xl font-bold">{item.value}</h2>
          </div>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card px-5 py-16 text-center">
          <Wrench className="mx-auto text-muted-foreground" size={40} />
          <h2 className="mt-4 text-xl font-semibold">
            No Booking Requests Yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Customer booking requests for your services will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="overflow-hidden rounded-xl border bg-card"
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                <img
                  src={booking.serviceImage}
                  alt={booking.serviceTitle}
                  className="h-44 w-full rounded-lg object-cover sm:h-36 sm:w-44"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-primary">{booking.category}</p>
                      <h2 className="mt-1 text-xl font-bold">
                        {booking.serviceTitle}
                      </h2>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                        booking.status,
                      )}`}
                    >
                      {booking.status.replace("-", " ")}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                    <p className="flex items-center gap-2">
                      <User size={16} />
                      {booking.customerName}
                    </p>

                    <p className="flex items-center gap-2">
                      <Phone size={16} />
                      {booking.customerPhone}
                    </p>

                    <p className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      {new Date(booking.preferredDate).toLocaleDateString()}
                    </p>

                    <p className="flex items-center gap-2">
                      <MapPin size={16} />
                      {booking.address}
                    </p>
                  </div>

                  <div className="mt-4 rounded-lg bg-muted/50 p-3">
                    <p className="text-xs font-semibold text-muted-foreground">
                      CUSTOMER PROBLEM
                    </p>
                    <p className="mt-1 text-sm">{booking.problemDescription}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Base Price
                      </p>
                      <p className="font-bold">
                        ৳{Number(booking.basePrice).toLocaleString("en-BD")}
                      </p>
                      {booking.finalAmount !== undefined && (
                        <p className="mt-1 text-sm text-green-600">
                          Final Amount: ৳
                          {booking.finalAmount.toLocaleString("en-BD")}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {booking.status === "requested" && (
                        <>
                          <button
                            disabled={updatingId === booking._id}
                            onClick={() =>
                              updateBookingStatus(booking, "accepted")
                            }
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle size={16} />
                            Accept
                          </button>

                          <button
                            disabled={updatingId === booking._id}
                            onClick={() =>
                              updateBookingStatus(booking, "rejected")
                            }
                            className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </>
                      )}

                      {booking.status === "accepted" && (
                        <button
                          disabled={updatingId === booking._id}
                          onClick={() =>
                            updateBookingStatus(booking, "in-progress")
                          }
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Clock size={16} />
                          Start Job
                        </button>
                      )}

                      {booking.status === "in-progress" && (
                        <div className="flex flex-wrap gap-2">
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            placeholder="Final amount (৳)"
                            value={finalAmounts[booking._id] || ""}
                            onChange={(e) =>
                              setFinalAmounts((previous) => ({
                                ...previous,
                                [booking._id]: e.target.value,
                              }))
                            }
                            className="h-10 w-40 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                          />

                          <button
                            disabled={updatingId === booking._id}
                            onClick={() =>
                              updateBookingStatus(booking, "completed")
                            }
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle size={16} />
                            Complete Job
                          </button>
                        </div>
                      )}

                      {updatingId === booking._id && (
                        <Loader2
                          size={20}
                          className="animate-spin text-primary"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
