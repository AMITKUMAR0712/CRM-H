import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "bg-[var(--color-clay)] text-white",
                secondary: "bg-[var(--color-olive)] text-white",
                outline: "border border-[var(--color-border)] text-[var(--color-graphite)]",
                success: "bg-green-100 text-green-800",
                warning: "bg-amber-100 text-amber-800",
                info: "bg-blue-100 text-blue-800",
                muted: "bg-[var(--color-limestone)] text-[var(--color-muted)]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
