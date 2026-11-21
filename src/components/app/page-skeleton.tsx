import { Skeleton } from "@/components/ui/skeleton";

/** Instant shell shown while route params resolve. */
export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-96 max-w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
