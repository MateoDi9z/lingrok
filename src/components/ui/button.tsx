import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:opacity-90",
        steel: "bg-steel text-bg hover:opacity-90",
        outline: "border border-border-strong bg-transparent text-fg hover:bg-elevated",
        ghost: "bg-transparent text-muted hover:bg-elevated hover:text-fg",
        danger: "bg-danger/15 text-danger hover:bg-danger/25",
        subtle: "bg-elevated text-fg hover:bg-elevated/80",
      },
      size: {
        sm: "h-9 rounded-sm px-3 text-sm",
        md: "h-11 rounded-md px-4 text-sm",
        lg: "h-12 rounded-lg px-5 text-base",
        icon: "size-11 rounded-md",
        pill: "h-8 rounded-full px-3 text-xs",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: Props) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
