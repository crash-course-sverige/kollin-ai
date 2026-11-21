"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

/** Mafs is a sizeable library and needs the browser: load it only when a figure is shown. */
export const MatrixFigure = dynamic(() => import("./matrix-figure").then((m) => m.MatrixFigure), {
  ssr: false,
  loading: () => <Skeleton className="my-3 h-[340px] w-full rounded-xl" />,
});
