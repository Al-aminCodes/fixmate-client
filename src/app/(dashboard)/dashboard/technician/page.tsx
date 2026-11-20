"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  Wrench,
  ClipboardList,
  Clock,
  CheckCircle2,
  Wallet,
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle,
  BriefcaseBusiness,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Service = {
  _id: string;
  title: string;
  category: string;
  basePrice: number;
  approvalStatus: "pending" | "approved" | "rejected";
  isAvailable: boolean;
};

type Booking = {
  _id: string;
  serviceTitle: string;
  serviceImage?: string;
  customerName: string;
  customerEmail: string;
  preferredDate: string;
  status:
    | "requested"
    | "accepted"
    | "rejected"
    | "in-progress"
    | "completed"
    | "cancelled";
  basePrice: number;
  finalAmount?: number;
  paymentStatus: "unpaid" | "paid";
  createdAt: string;
};

export default function TechnicianOverviewPage() {
  const { data: session } = useSession();
  const token = session?.session.token;

  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError("");

        const [serviceRes, bookingRes] = await Promise.all([
          fetch(`${API_URL}/technician/services`, {
            credentials: "include",
            headers: {
              authorization: `Bearer ${token}`,
            },
          }),
          fetch(
            `${API_URL}/bookings?technicianEmail=${encodeURIComponent(
              session?.user?.email || "",
            )}`,
            {
              credentials: "include",
              headers: {
                authorization: `Bearer ${token}`,
              },
            },
          ),
        ]);

        if (!serviceRes.ok || !bookingRes.ok) {
          throw new Error("Failed to load technician dashboard.");
        }

        const serviceData = await serviceRes.json();
        const bookingData = await bookingRes.json();

        setServices(serviceData.services || []);
        setBookings(bookingData.bookings || []);
      } catch (err) {
        console.error("Technician overview error:", err);
        setError("Unable to load your dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email) {
      fetchOverview();
    }
  }, [session?.user?.email]);

  const approvedServices = services.filter(
    (service) => service.approvalStatus === "approved",
  );

  const pendingServices = services.filter(
    (service) => service.approvalStatus === "pending",
  );

  const activeJobs = bookings.filter((booking) =>
    ["accepted", "in-progress"].includes(booking.status),
  );

  const completedJobs = bookings.filter(
    (booking) => booking.status === "completed",
  );

  const pendingRequests = bookings.filter(
    (booking) => booking.status === "requested",
  );

  // Earnings represent completed job amounts, not necessarily received payments.
  const totalEarnings = completedJobs.reduce(
    (total, booking) =>
      total + Number(booking.finalAmount ?? booking.basePrice ?? 0),
    0,
  );

  const recentRequests = [...bookings]
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
          <p className="text-sm text-muted-foreground">Technician Dashboard</p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {session?.user?.name || "Technician"}!
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage your services and keep track of your repair jobs.
          </p>
        </div>

        <Link
          href="/dashboard/technician/add-service"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add New Service
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Service Statistics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Service Overview</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Services"
            value={services.length}
            description="Services you have created"
            icon={<Wrench className="h-5 w-5" />}
          />

          <StatCard
            title="Approved Services"
            value={approvedServices.length}
            description="Services approved by admin"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <StatCard
            title="Pending Approval"
            value={pendingServices.length}
            description="Waiting for admin review"
            icon={<Clock className="h-5 w-5" />}
          />

          <StatCard
            title="Available Services"
            value={
              services.filter(
                (service) =>
                  service.approvalStatus === "approved" && service.isAvailable,
              ).length
            }
            description="Currently available to customers"
            icon={<BriefcaseBusiness className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* Job Statistics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Repair Job Overview</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Requests"
            value={bookings.length}
            description="All repair requests"
            icon={<ClipboardList className="h-5 w-5" />}
          />

          <StatCard
            title="New Requests"
            value={pendingRequests.length}
            description="Waiting for your response"
            icon={<Clock className="h-5 w-5" />}
          />

          <StatCard
            title="Active Jobs"
            value={activeJobs.length}
            description="Accepted or in progress"
            icon={<BriefcaseBusiness className="h-5 w-5" />}
          />

          <StatCard
            title="Completed Jobs"
            value={completedJobs.length}
            description="Successfully completed"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* Earnings */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <Wallet className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Completed Job Value</p>
            <h2 className="mt-1 text-2xl font-bold">
              ৳{totalEarnings.toLocaleString("en-BD")}
            </h2>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Calculated from completed jobs using their final amounts. This is not
          necessarily the amount already paid to you.
        </p>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <QuickAction
            href="/dashboard/technician/add-service"
            title="Add New Service"
            description="Create a new repair service listing."
            icon={<Plus className="h-6 w-6" />}
          />

          <QuickAction
            href="/dashboard/technician/my-services"
            title="My Services"
            description="Edit and manage your service listings."
            icon={<Wrench className="h-6 w-6" />}
          />

          <QuickAction
            href="/dashboard/technician/requests"
            title="Manage Requests"
            description="Accept, reject, and update repair jobs."
            icon={<ClipboardList className="h-6 w-6" />}
          />
        </div>
      </section>

      {/* Recent Requests */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="font-semibold">Recent Repair Requests</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest customer booking requests
            </p>
          </div>

          <Link
            href="/dashboard/technician/requests"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="font-semibold">No repair requests yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Customer requests will appear here when they book your services.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentRequests.map((booking) => (
              <div
                key={booking._id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-medium">{booking.serviceTitle}</h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Customer: {booking.customerName}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Preferred date:{" "}
                    {new Date(booking.preferredDate).toLocaleDateString()}
                  </p>
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
                    ).toLocaleString("en-BD")}
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
