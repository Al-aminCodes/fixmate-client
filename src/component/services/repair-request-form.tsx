"use client";

import { authClient, useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Service } from "./service-type";

type Props = {
  service: Service;
};

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const RepairRequestForm = ({ service }: Props) => {
  const router = useRouter();

  const { data: session, isPending } = useSession();

  const token = session?.session.token;

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    preferredDate: "",
    problemDescription: "",
  });

  const user = session?.user;
  const role = user?.role;

  const handleRequest = () => {
    if (isPending) return;

    // Logged-out user
    if (!user) {
      router.push(
        `/sign-in?redirectTo=${encodeURIComponent(`/services/${service._id}`)}`,
      );
      return;
    }

    // Technician and Admin cannot request
    if (role !== "customer") {
      return;
    }

    setShowForm(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || role !== "customer") {
      toast.error("Only customers can request a repair");
      return;
    }

    if (!token) {
      toast.error("Your session has expired. Please log in again.");
      return;
    }

    if (!formData.phone.trim() || !formData.address.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.problemDescription.trim().length < 20) {
      toast.error("Problem description must be at least 20 characters");
      return;
    }

    if (formData.preferredDate < getToday()) {
      toast.error("Please select today or a future date");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            serviceId: service._id,
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            preferredDate: formData.preferredDate,
            problemDescription: formData.problemDescription.trim(),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error("You already have an active request for this service");
          return;
        }

        throw new Error(result.message || "Failed to submit repair request");
      }

      toast.success("Repair request submitted successfully!");

      setSubmitted(true);
      setShowForm(false);

      router.refresh();
    } catch (error) {
      console.error("Booking submission error:", error);

      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  // Successful request
  if (submitted) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          Your repair request has been submitted successfully.
        </div>

        <Link
          href="/dashboard/customer/bookings"
          className="block w-full rounded-lg bg-primary px-5 py-3 text-center font-semibold text-primary-foreground hover:opacity-90"
        >
          View My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Request button */}
      {role && role !== "customer" ? (
        <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
          Only customers can request a repair.
        </div>
      ) : (
        <button
          type="button"
          onClick={handleRequest}
          disabled={isPending || loading}
          className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Checking..." : "Request Repair"}
        </button>
      )}

      {/* Request form */}
      {showForm && role === "customer" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Name</label>

            <input
              type="text"
              value={user?.name || ""}
              readOnly
              className="w-full rounded-lg border bg-muted px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>

            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full rounded-lg border bg-muted px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Phone</label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
              className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Address</label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              required
              className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Preferred Date
            </label>

            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              min={getToday()}
              required
              className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Problem Description
            </label>

            <textarea
              name="problemDescription"
              value={formData.problemDescription}
              onChange={handleChange}
              placeholder="Describe your problem in detail..."
              minLength={20}
              required
              rows={4}
              className="w-full resize-none rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            />

            <p className="mt-1 text-xs text-muted-foreground">
              Minimum 20 characters ({formData.problemDescription.trim().length}
              /20)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Repair Request"}
          </button>

          <button
            type="button"
            onClick={() => setShowForm(false)}
            disabled={loading}
            className="w-full rounded-lg border px-5 py-3 font-medium"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default RepairRequestForm;
