import { Metadata } from "next";
import { SettingsForm } from "@/features/settings/components/settings-form";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings",
};

export default function SettingsPage() {
  // Mock user data since we removed authentication
  const user = {
    id: "user-1",
    name: "Demo User",
    email: "user@example.com",
    image: null,
    role: "user"
  };
  
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="grid gap-6">
        <SettingsForm user={user} />
      </div>
    </div>
  );
} 