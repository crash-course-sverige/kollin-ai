import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth({ 
  required = false, 
  role = null,
  redirectTo = "/auth/login",
  redirectIfFound = false,
}: { 
  required?: boolean;
  role?: string | null;
  redirectTo?: string;
  redirectIfFound?: boolean;
} = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;
  const hasRequiredRole = role ? session?.user?.role === role : true;

  useEffect(() => {
    if (isLoading) return;

    if (required && !isAuthenticated) {
      router.push(`${redirectTo}?callbackUrl=${window.location.href}`);
      return;
    }

    if (required && !hasRequiredRole) {
      router.push("/unauthorized");
      return;
    }

    if (redirectIfFound && isAuthenticated) {
      router.push(redirectTo);
      return;
    }
  }, [isLoading, isAuthenticated, hasRequiredRole, required, redirectIfFound, redirectTo, router]);

  return {
    isLoading,
    isAuthenticated,
    session,
    user: session?.user,
    hasRequiredRole,
  };
} 