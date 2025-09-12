import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-dozyr-gold text-dozyr-black hover:bg-dozyr-gold/80",
        secondary:
          "border-transparent bg-dozyr-medium-gray text-black hover:bg-dozyr-medium-gray/80",
        destructive:
          "border-transparent bg-red-500 text-black hover:bg-red-500/80",
        outline: "text-black border-dozyr-medium-gray hover:bg-dozyr-medium-gray/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }