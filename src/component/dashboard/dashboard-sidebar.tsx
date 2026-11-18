"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import {
  LayoutDashboard,
  CalendarDays,
  CreditCard,
  PlusCircle,
  BriefcaseBusiness,
  ClipboardList,
  Users,
  Wrench,
  Receipt,
  UserRound,
  Home,
  LogOut,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = {
  customer: [
    { title: "Overview", url: "/dashboard/customer", icon: LayoutDashboard },
    {
      title: "My Bookings",
      url: "/dashboard/customer/bookings",
      icon: CalendarDays,
    },
    {
      title: "Payments",
      url: "/dashboard/customer/payments",
      icon: CreditCard,
    },
  ],
  technician: [
    { title: "Overview", url: "/dashboard/technician", icon: LayoutDashboard },
    {
      title: "Add Service",
      url: "/dashboard/technician/add-service",
      icon: PlusCircle,
    },
    {
      title: "My Services",
      url: "/dashboard/technician/my-services",
      icon: BriefcaseBusiness,
    },
    {
      title: "Booking Requests",
      url: "/dashboard/technician/requests",
      icon: ClipboardList,
    },
  ],
  admin: [
    { title: "Overview", url: "/dashboard/admin", icon: LayoutDashboard },
    { title: "Manage Users", url: "/dashboard/admin/users", icon: Users },
    {
      title: "Manage Services",
      url: "/dashboard/admin/services",
      icon: Wrench,
    },
    {
      title: "All Bookings",
      url: "/dashboard/admin/bookings",
      icon: CalendarDays,
    },
    {
      title: "Transactions",
      url: "/dashboard/admin/transactions",
      icon: Receipt,
    },
  ],
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const user = session?.user;
  const role = user?.role as keyof typeof menuItems | undefined;
  const items = role ? menuItems[role] : [];

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
    router.refresh();
  };

  if (isPending) return null;

  const displayRole = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "Account";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border bg-background"
    >
      {/* Brand */}
      <SidebarHeader className="border-b border-border px-4 py-5">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Wrench className="h-5 w-5" />
          </div>

          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <h2 className="text-xl font-bold tracking-tight">
              FixMate<span className="text-primary">.</span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Repair Service Platform
            </p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {displayRole} Menu
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {items.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== `/dashboard/${role}` &&
                    pathname.startsWith(`${item.url}/`));

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      onClick={() => router.push(item.url)}
                      className={`
                        flex h-11 w-full items-center gap-3 rounded-lg px-3
                        transition-all duration-200
                        [&>svg]:!size-[18px] [&>svg]:shrink-0
                        ${
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }
                      `}
                    >
                      <item.icon />
                      <span className="flex-1 truncate text-sm">
                        {item.title}
                      </span>
                      {isActive && (
                        <ChevronRight className="ml-auto !size-4 opacity-80" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account links */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Account
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="My Profile"
                  isActive={pathname === "/dashboard/profile"}
                  onClick={() => router.push("/dashboard/profile")}
                  className="h-11 rounded-lg px-3 [&>svg]:!size-[18px] [&>svg]:shrink-0"
                >
                  <UserRound />
                  <span className="text-sm">My Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Back to Home"
                  onClick={() => router.push("/")}
                  className="h-11 rounded-lg px-3 [&>svg]:!size-[18px] [&>svg]:shrink-0"
                >
                  <Home />
                  <span className="text-sm">Back to Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User profile and logout */}
      <SidebarFooter className="border-t border-border p-3">
        <div className="flex items-center gap-3 overflow-hidden rounded-xl bg-muted/60 p-2.5">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-background"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="h-5 w-5" />
            </div>
          )}

          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">
              {user?.name || "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>

        <SidebarMenu className="mt-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              onClick={handleSignOut}
              className="h-10 rounded-lg px-3 text-red-500 hover:bg-red-500/10 hover:text-red-600 [&>svg]:!size-[18px]"
            >
              <LogOut />
              <span className="text-sm font-medium">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
