"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, LayoutDashboard, UserRound, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { useSession, signOut } from "@/lib/auth-client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Role = "customer" | "technician" | "admin";

const navigationLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About Us", href: "/about" },
];

const dashboardRoutes: Record<Role, string> = {
  customer: "/dashboard/customer",
  technician: "/dashboard/technician",
  admin: "/dashboard/admin",
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = useSession();

  const user = session?.user;

  // Read the custom role field added in Better Auth
  const role = ((user as typeof user & { role?: Role })?.role ||
    "customer") as Role;

  const dashboardUrl = dashboardRoutes[role];
  const profileUrl = `/dashboard/profile`;

  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await signOut();

      toast.success("Signed out successfully");

      router.replace("/sign-in");
      router.refresh();
    } catch {
      toast.error("Unable to sign out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
            F
          </div>

          <span className="text-xl font-bold tracking-tight text-slate-900">
            Fix<span className="text-blue-600">Mate</span>
          </span>
        </Link>

        {/* Navigation links */}
        <div className="hidden items-center gap-8 md:flex">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-blue-600"
              }`}
            >
              {link.name}
              {isActive(link.href) && (
                <span className="mt-1 block h-0.5 rounded-full bg-blue-600" />
              )}
            </Link>
          ))}
        </div>

        {/* Authentication section */}
        <div className="flex items-center gap-3">
          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-200" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border p-1 pr-3 bg-white">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "Profile"}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}

                <span className="hidden text-sm font-medium sm:block">
                  {user.name}
                </span>

                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <div className="px-3 py-2">
                  <p className="font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>

                  <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium capitalize text-blue-700">
                    {role}
                  </span>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => router.push(dashboardUrl)}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => router.push(profileUrl)}>
                  <UserRound className="mr-2 h-4 w-4" />
                  Update Profile
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {loggingOut ? "Signing out..." : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-blue-600"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
