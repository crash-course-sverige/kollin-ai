import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { UsersTable } from "@/features/users/components/users-table";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage users in your application",
};

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard/users");
  }
  
  // Check if user has admin role
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage users and their permissions
        </p>
      </div>
      
      <UsersTable />
    </div>
  );
} 