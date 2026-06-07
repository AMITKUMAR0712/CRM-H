import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full rounded-xl border border-[var(--color-border)] bg-(--color-surface) px-4 py-3 text-base text-(--color-graphite) transition-all duration-200 shadow-sm",
                    "placeholder:text-[var(--color-muted)]",
                    "focus:outline-none focus:ring-4 focus:ring-[var(--color-clay)]/10 focus:border-[var(--color-clay)] focus:shadow-md",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
