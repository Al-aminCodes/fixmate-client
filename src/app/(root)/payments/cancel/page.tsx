"use client";

import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
          ✕
        </div>

        <h1 className="mb-2 text-2xl font-bold">Payment Cancelled</h1>

        <p className="mb-6 text-gray-500">
          You cancelled the payment process. Your booking is still available for
          payment.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/customer/bookings"
            className="rounded-lg bg-blue-600 px-5 py-3 text-white"
          >
            Try Payment Again
          </Link>

          <Link href="/" className="rounded-lg border px-5 py-3">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
