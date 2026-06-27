import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export default function Loading({ label = "Loading…", className, size = "md" }: LoadingProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2 text-slate-500", className)}>
      <Loader2 className={cn("animate-spin", sizeMap[size])} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
