import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6 text-center max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Modern Next.js Application
        </h1>
        <p className="text-xl text-muted-foreground">
          A modern, type-safe Next.js 15 application with responsive design and a feature-based architecture.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
