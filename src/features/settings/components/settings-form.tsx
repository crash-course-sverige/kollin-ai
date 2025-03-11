"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsFormProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Profile</h3>
          <p className="text-sm text-muted-foreground">
            Name: {user.name || "Not set"}
          </p>
          <p className="text-sm text-muted-foreground">
            Email: {user.email}
          </p>
          <p className="text-sm text-muted-foreground">
            Role: {user.role}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>Edit Profile</Button>
        </div>
      </CardContent>
    </Card>
  );
} 