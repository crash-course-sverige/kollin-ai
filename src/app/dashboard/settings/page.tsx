import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { SettingsForm } from "@/features/settings/components/settings-form";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard/settings");
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="grid gap-6">
        <SettingsForm user={session.user} />
      </div>
    </div>
  );
} 