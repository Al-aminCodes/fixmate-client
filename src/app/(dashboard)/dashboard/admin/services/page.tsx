"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Check,
  X,
  Clock,
  Loader2,
  RefreshCw,
  Wrench,
  MapPin,
  CalendarDays,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ApprovalStatus = "pending" | "approved" | "rejected";

type Service = {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: string;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: ApprovalStatus;
  isAvailable: boolean;
  createdAt: string;
};

const filters = ["all", "pending", "approved", "rejected"] as const;

export default function AdminServicesPage() {
  const { data: session, isPending: sessionLoading } = useSession();

  const [services, setServices] = useState<Service[]>([]);
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const user = session?.user;

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/admin/services`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load services.");
      }

      setServices(Array.isArray(result.services) ? result.services : []);
    } catch (error) {
      console.error("Fetch services error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load services.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      const timeoutId = window.setTimeout(() => {
        void fetchServices();
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [user, fetchServices, refreshKey]);

  const handleApproval = async (
    serviceId: string,
    approvalStatus: "approved" | "rejected",
  ) => {
    const action = approvalStatus === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this service?`,
    );

    if (!confirmed) return;

    try {
      setUpdatingId(serviceId);

      const response = await fetch(
        `${API_URL}/admin/services/${serviceId}/approval`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ approvalStatus }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Could not ${action} service.`);
      }

      setServices((previous) =>
        previous.map((service) =>
          service._id === serviceId ? { ...service, approvalStatus } : service,
        ),
      );

      toast.success(
        approvalStatus === "approved"
          ? "Service approved successfully!"
          : "Service rejected successfully.",
      );
    } catch (error) {
      console.error("Service approval error:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredServices = services
    .filter((service) =>
      activeFilter === "all" ? true : service.approvalStatus === activeFilter,
    )
    .sort((a, b) => {
      if (a.approvalStatus === "pending" && b.approvalStatus !== "pending") {
        return -1;
      }
      if (b.approvalStatus === "pending" && a.approvalStatus !== "pending") {
        return 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const counts = {
    all: services.length,
    pending: services.filter((item) => item.approvalStatus === "pending")
      .length,
    approved: services.filter((item) => item.approvalStatus === "approved")
      .length,
    rejected: services.filter((item) => item.approvalStatus === "rejected")
      .length,
  };

  const statusStyle = (status: ApprovalStatus) => {
    if (status === "approved") {
      return "bg-green-500/10 text-green-600";
    }
    if (status === "rejected") {
      return "bg-red-500/10 text-red-600";
    }
    return "bg-amber-500/10 text-amber-600";
  };

  if (sessionLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">Access denied</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Only administrators can manage service approvals.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Service Approval
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and manage services submitted by technicians.
          </p>
        </div>

        <button
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-xl border p-4 text-left transition ${
              activeFilter === filter
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "bg-card hover:bg-muted/50"
            }`}
          >
            <p className="text-sm capitalize text-muted-foreground">
              {filter === "all" ? "Total Services" : `${filter} Services`}
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {counts[filter]}
            </p>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
              activeFilter === filter
                ? "bg-primary text-primary-foreground"
                : "border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {filter}
            <span className="ml-2 opacity-75">({counts[filter]})</span>
          </button>
        ))}
      </div>

      {/* Service list */}
      {isLoading ? (
        <div className="flex min-h-60 items-center justify-center rounded-xl border bg-card">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border bg-card p-6 text-center">
          <div className="mb-3 rounded-full bg-muted p-4">
            <Wrench className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="font-semibold">No services found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            There are no {activeFilter === "all" ? "" : activeFilter} services
            to display.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.map((service) => (
            <article
              key={service._id}
              className="overflow-hidden rounded-xl border bg-card"
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                {/* Service image */}
                <div className="h-48 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-36 sm:w-44">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Wrench className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Service details */}
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {service.category}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(
                        service.approvalStatus,
                      )}`}
                    >
                      {service.approvalStatus}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">{service.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      ${service.basePrice}
                    </span>
                    <span>{service.estimatedDuration}</span>
                    <span>{service.serviceMode}</span>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
                    <span className="flex items-center gap-1">
                      <Wrench className="h-3.5 w-3.5" />
                      {service.technicianName}
                    </span>
                    <span>{service.technicianEmail}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {service.serviceArea}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {service.createdAt
                        ? new Date(service.createdAt).toLocaleDateString()
                        : "Date unavailable"}
                    </span>
                  </div>
                </div>

                {/* Approval actions */}
                <div className="flex shrink-0 flex-row gap-2 sm:w-32 sm:flex-col sm:justify-center">
                  {service.approvalStatus !== "approved" && (
                    <button
                      onClick={() => handleApproval(service._id, "approved")}
                      disabled={updatingId === service._id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50 sm:flex-none"
                    >
                      {updatingId === service._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Approve
                    </button>
                  )}

                  {service.approvalStatus !== "rejected" && (
                    <button
                      onClick={() => handleApproval(service._id, "rejected")}
                      disabled={updatingId === service._id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/30 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 sm:flex-none"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  )}

                  {service.approvalStatus === "approved" && (
                    <span className="text-center text-xs text-green-600 sm:mt-1">
                      <Check className="mr-1 inline h-3.5 w-3.5" />
                      Approved
                    </span>
                  )}

                  {service.approvalStatus === "rejected" && (
                    <span className="text-center text-xs text-red-600 sm:mt-1">
                      <X className="mr-1 inline h-3.5 w-3.5" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
