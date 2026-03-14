import { cn } from "@/lib/utils";

export default function LoadingSpinner({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin", sizeMap[size])} />
    </div>
  );
}
