import { cn } from "@/lib/utils";
import { getStatusColor } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  return (
    <span className={cn("badge capitalize", getStatusColor(status), className)}>
      {status}
    </span>
  );
}
