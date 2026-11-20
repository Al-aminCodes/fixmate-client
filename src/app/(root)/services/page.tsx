"use client";

import {
  ArrowRight,
  Clock,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

type Service = {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: "Home Visit" | "Shop Drop-off";
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: "pending" | "approved" | "rejected";
  isAvailable: boolean;
  createdAt: string;
};

const categories = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

function ServicesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Update URL query parameters.
  const updateURL = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const queryString = params.toString();

    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  // Handle search form submission.
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateURL("search", searchInput.trim());
  };

  // Fetch services whenever URL filters change.
  useEffect(() => {
    const fetchServices = async () => {
      const controller = new AbortController();

      try {
        setLoading(true);

        const params = new URLSearchParams();

        if (search) {
          params.set("search", search);
        }

        if (category !== "all") {
          params.set("category", category);
        }

        const queryString = params.toString();

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error("API URL is not configured.");
        }

        const response = await fetch(
          `${apiUrl}/services${queryString ? `?${queryString}` : ""}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch services.");
        }

        const data = await response.json();

        setServices(data.services || []);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Fetch services error:", error);
        toast.error("Could not load services.");
        setServices([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }

      return () => controller.abort();
    };

    fetchServices();
  }, [search, category]);

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Heading */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Wrench size={16} />
            FixMate Services
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Find the Right Repair Service
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Find trusted technicians for your devices and home appliances. Book
            a repair service with confidence.
          </p>
        </div>

        {/* Search and Category Filter */}
        <div className="mb-8 rounded-xl border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  type="text"
                  placeholder="Search services by title..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-12 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                className="flex h-12 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Search size={17} />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {/* Category Filter */}
            <div className="relative md:w-64">
              <SlidersHorizontal
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <select
                value={category}
                onChange={(e) => updateURL("category", e.target.value)}
                className="h-12 w-full appearance-none rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Categories</option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(search || category !== "all") && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Active filters:</span>

              {search && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                  Search: {search}
                </span>
              )}

              {category !== "all" && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                  {category}
                </span>
              )}

              <button
                onClick={() => {
                  setSearchInput("");
                  router.push(pathname);
                }}
                className="font-medium text-destructive hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Results Heading */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Available Services</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading
                ? "Finding services..."
                : `${services.length} services found`}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={35} className="animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading services...
              </p>
            </div>
          </div>
        ) : services.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed bg-card px-4 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Wrench size={30} />
            </div>

            <h3 className="text-xl font-semibold">No Services Found</h3>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              We couldn&apos;t find any services matching your search. Try
              another keyword or choose a different category.
            </p>

            <button
              onClick={() => {
                setSearchInput("");
                router.push(pathname);
              }}
              className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              View All Services
            </button>
          </div>
        ) : (
          /* Services Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service) => (
              <div
                key={service._id}
                className="group flex flex-col overflow-hidden rounded-xl border bg-card transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Service Image */}
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
                    {service.category}
                  </span>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {service.serviceMode}
                    </span>

                    <span className="text-sm font-bold text-primary">
                      ৳{Number(service.basePrice).toLocaleString("en-BD")}
                    </span>
                  </div>

                  <h3 className="line-clamp-1 text-lg font-bold">
                    {service.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-muted-foreground">
                    {service.description}
                  </p>

                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="shrink-0 text-primary" />
                      <span className="line-clamp-1">
                        {service.serviceArea}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={16} className="shrink-0 text-primary" />
                      <span>{service.estimatedDuration}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Wrench size={16} className="shrink-0 text-primary" />
                      <span className="line-clamp-1">
                        {service.technicianName}
                      </span>
                    </div>
                  </div>

                  {/* Details Button */}
                  <div className="mt-auto pt-5">
                    <Link
                      href={`/services/${service._id}`}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      View Details
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={35} />
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}
