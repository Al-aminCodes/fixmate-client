"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  CreditCard,
  UserRound,
  PlusCircle,
  BriefcaseBusiness,
  ClipboardList,
  Users,
  Wrench,
  Receipt,
  LogOut,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { useSession, signOut } from "@/lib/auth-client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type Role = "customer" | "technician" | "admin";

const dashboardMenus = {
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
    { title: "Profile", url: "/dashboard/customer/profile", icon: UserRound },
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
      title: "Service Requests",
      url: "/dashboard/technician/requests",
      icon: ClipboardList,
    },
    { title: "Profile", url: "/dashboard/technician/profile", icon: UserRound },
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
      title: "Manage Bookings",
      url: "/dashboard/admin/bookings",
      icon: CalendarDays,
    },
    {
      title: "Transactions",
      url: "/dashboard/admin/transactions",
      icon: Receipt,
    },
    { title: "Profile", url: "/dashboard/admin/profile", icon: UserRound },
  ],
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session } = useSession();
  const user = session?.user;

  const role = (user as typeof user & { role?: Role })?.role || "customer";

  const menus = dashboardMenus[role as Role] || dashboardMenus.customer;

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.replace("/sign-in");
      router.refresh();
    } catch {
      toast.error("Unable to sign out");
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
            F
          </div>
          <span className="text-xl font-bold group-data-[collapsible=icon]:hidden">
            Fix<span className="text-blue-600">Mate</span>
          </span>
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </SidebarGroupLabel>

          <SidebarMenu>
            {menus.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.url ||
                (item.url !== `/dashboard/${role}` &&
                  pathname.startsWith(`${item.url}/`));

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    isActive={active}
                    tooltip={item.title}
                    onClick={() => router.push(item.url)}
                  >
                    <Icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              onClick={() => router.push(`/dashboard/${role}/profile`)}
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sign Out" onClick={handleLogout}>
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {user && (
          <div className="flex items-center gap-2 border-t px-2 py-3 group-data-[collapsible=icon]:hidden">
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

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs capitalize text-muted-foreground">
                {role}
              </p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
