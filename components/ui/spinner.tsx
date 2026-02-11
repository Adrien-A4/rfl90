import { LoaderIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: number;
} & React.HTMLAttributes<HTMLSpanElement>;

function Spinner({ className, size = 4, ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <LoaderIcon className={`size-${size} animate-spin`} />
    </span>
  );
}

export { Spinner };
