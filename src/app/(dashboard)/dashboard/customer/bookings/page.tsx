"use client";

import { useSession } from "@/lib/auth-client";
import { useCallback, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type BookingStatus =
  | "requested"
  | "accepted"
  | "in-progress"
  | "completed"
  | "rejected"
  | "cancelled";

type Booking = {
  _id: string;
  serviceTitle: string;
  serviceImage: string;
  technicianName: string;
  preferredDate: string;
  basePrice: number;
  finalAmount?: number;
  status: BookingStatus;
  paymentStatus: "unpaid" | "paid";
};

const statusStyles: Record<BookingStatus, string> = {
  requested: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  "in-progress": "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
};

const statusLabels: Record<BookingStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  "in-progress": "In Progress",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export default function CustomerBookingsPage() {
  const { data: session, isPending } = useSession();
  const token = session?.session.token;

  const user = session?.user;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/customer/bookings`, {
        credentials: "include",
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load bookings");
      }

      setBookings(data.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!isPending && user?.role === "customer") {
      queueMicrotask(() => {
        void loadBookings();
      });
    }
  }, [isPending, user?.role, loadBookings]);

  const handleCancel = async () => {
    if (!selectedBooking) return;

    try {
      setCancelling(true);

      const response = await fetch(
        `${API_URL}/customer/bookings/${selectedBooking._id}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel booking");
      }

      setBookings((previous) =>
        previous.map((booking) =>
          booking._id === selectedBooking._id
            ? { ...booking, status: "cancelled" }
            : booking,
        ),
      );

      setSelectedBooking(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cancellation failed");
    } finally {
      setCancelling(false);
    }
  };

  const handlePayment = async (bookingId: string) => {
    try {
      setPayingId(bookingId);

      const response = await fetch(
        `${API_URL}/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ bookingId }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not start payment");
      }

      if (!data.url) {
        throw new Error("Checkout URL was not returned");
      }

      window.location.assign(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Payment failed");
      setPayingId(null);
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading your bookings...</p>
      </div>
    );
  }

  if (user?.role !== "customer") {
    return (
      <div className="p-6 text-center">
        <p>You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your repair requests and payments.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
          <button
            onClick={loadBookings}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {!error && bookings.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          <h2 className="text-lg font-semibold">No bookings yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your repair bookings will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4">Service</th>
                  <th className="p-4">Technician</th>
                  <th className="p-4">Preferred Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.serviceImage}
                          alt={booking.serviceTitle}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <span className="font-medium">
                          {booking.serviceTitle}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">{booking.technicianName}</td>

                    <td className="p-4">
                      {new Date(booking.preferredDate).toLocaleDateString()}
                    </td>

                    <td className="p-4 font-medium">
                      {booking.finalAmount ?? booking.basePrice}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[booking.status]}`}
                      >
                        {statusLabels[booking.status]}
                      </span>
                    </td>

                    <td className="p-4">
                      {booking.paymentStatus === "paid" ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Paid
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          Unpaid
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <BookingActions
                        booking={booking}
                        onCancel={() => setSelectedBooking(booking)}
                        onPay={() => handlePayment(booking._id)}
                        paying={payingId === booking._id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-4 md:hidden">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="space-y-4 rounded-xl border p-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={booking.serviceImage}
                    alt={booking.serviceTitle}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{booking.serviceTitle}</h3>
                    <p className="text-sm text-gray-500">
                      {booking.technicianName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Preferred Date</p>
                    <p>
                      {new Date(booking.preferredDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Amount</p>
                    <p className="font-semibold">
                      {booking.finalAmount ?? booking.basePrice}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[booking.status]}`}
                  >
                    {statusLabels[booking.status]}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      booking.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {booking.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                  </span>
                </div>

                <BookingActions
                  booking={booking}
                  onCancel={() => setSelectedBooking(booking)}
                  onPay={() => handlePayment(booking._id)}
                  paying={payingId === booking._id}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Cancel confirmation modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Cancel Booking?</h2>

            <p className="text-sm text-gray-600">
              Are you sure you want to cancel your booking for{" "}
              <strong>{selectedBooking.serviceTitle}</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                disabled={cancelling}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Keep Booking
              </button>

              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function BookingActions({
  booking,
  onCancel,
  onPay,
  paying,
}: {
  booking: Booking;
  onCancel: () => void;
  onPay: () => void;
  paying: boolean;
}) {
  if (booking.status === "requested") {
    return (
      <button
        onClick={onCancel}
        className="rounded-lg border border-red-500 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        Cancel
      </button>
    );
  }

  if (booking.status === "completed" && booking.paymentStatus === "unpaid") {
    return (
      <button
        onClick={onPay}
        disabled={paying}
        className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
      >
        {paying ? "Redirecting..." : "Pay Now"}
      </button>
    );
  }

  if (booking.paymentStatus === "paid") {
    return <span className="text-xs font-semibold text-green-700">Paid</span>;
  }

  return <span className="text-xs text-gray-400">No action</span>;
}
