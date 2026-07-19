import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  firstName: string;
  lastName: string;
  size?: "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  md: "h-12 w-12 text-base",
  lg: "h-20 w-20 text-2xl",
};

export function Avatar({ firstName, lastName, size = "md", className }: AvatarProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-slate-900 font-semibold text-white",
        SIZE_CLASSES[size],
        className
      )}
    >
      {initials}
    </span>
  );
}
