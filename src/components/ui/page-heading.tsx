import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeading({
  title,
  description,
  actions,
  className,
  ...props
}: PageHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 md:flex-row md:items-center md:justify-between",
        className
      )}
      {...props}
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground md:text-lg">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
} 