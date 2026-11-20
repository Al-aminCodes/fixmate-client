"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
          ✓
        </div>

        <h1 className="mb-2 text-2xl font-bold">Payment Successful!</h1>

        <p className="mb-6 text-gray-500">
          Thank you! Your payment was submitted successfully. Your booking
          payment status will be confirmed through Stripe.
        </p>

        {sessionId && (
          <p className="mb-5 break-all text-xs text-gray-400">
            Session ID: {sessionId}
          </p>
        )}

        <Link
          href="/dashboard/customer/bookings"
          className="inline-block rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          View My Bookings
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center">Loading...</p>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
