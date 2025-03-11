"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3,
  FileText,
  GraduationCap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["user", "admin"],
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Courses",
    href: "/courses",
    icon: GraduationCap,
    roles: ["user", "admin"],
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
    roles: ["user", "admin"],
  },
  {
    title: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
    roles: ["user", "admin"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["user", "admin"],
  },
];

interface DashboardNavProps {
  user: {
    role: string;
  };
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  return (
    <nav className="grid items-start gap-2 px-2 py-4">
      {filteredNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
          )}
        >
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Button>
        </Link>
      ))}
    </nav>
  );
} 