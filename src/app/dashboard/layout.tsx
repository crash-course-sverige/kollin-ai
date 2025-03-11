import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { DashboardNav } from "@/features/dashboard/components/dashboard-nav";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard for your application",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={session.user} />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <DashboardNav user={session.user} />
        </aside>
        <main className="flex w-full flex-col overflow-hidden pt-6">
          {children}
        </main>
      </div>
    </div>
  );
} 