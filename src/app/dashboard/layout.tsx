import { Metadata } from "next";
import { DashboardNav } from "@/features/dashboard/components/dashboard-nav";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard for your application",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock user data since we removed authentication
  const user = {
    name: "Demo User",
    email: "user@example.com",
    image: null,
    role: "user"
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <DashboardNav user={user} />
        </aside>
        <main className="flex w-full flex-col overflow-hidden pt-6">
          {children}
        </main>
      </div>
    </div>
  );
} 