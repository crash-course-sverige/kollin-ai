import { Metadata } from "next";
import { UsersTable } from "@/features/users/components/users-table";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage users in your application",
};

export default function UsersPage() {
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