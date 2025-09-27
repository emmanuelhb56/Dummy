// components/ui/separator.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  decorative?: boolean;
};

export function Separator({ className, decorative = true, ...props }: SeparatorProps) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation="horizontal"
      className={cn("h-px w-full bg-border", className)}
      {...props}
    />
  );
}