import * as React from "react";
import { cn } from "@/lib/utils";

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
  variant?: "default" | "sidebar";
}

export function Shell({
  children,
  className,
  as: Component = "div",
  variant = "default",
  ...props
}: ShellProps) {
  return (
    <Component
      className={cn(
        "container grid items-start gap-8 pb-8 pt-6 md:py-8",
        variant === "sidebar" && "md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
} 