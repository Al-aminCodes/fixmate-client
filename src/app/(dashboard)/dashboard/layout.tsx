"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Separator } from "@/components/ui/separator";
import { DashboardSidebar } from "@/component/dashboard/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />

      <SidebarInset>
        <header className="flex h-16 items-center gap-3 border-b px-4">
          <SidebarTrigger />

          <Separator orientation="vertical" className="h-6" />

          <div className="flex-1">
            <h1 className="text-sm font-semibold">FixMate Dashboard</h1>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] bg-muted/30 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
