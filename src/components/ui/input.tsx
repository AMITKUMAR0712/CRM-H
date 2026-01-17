import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-base transition-all duration-200",
                    "placeholder:text-[var(--color-muted)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--color-clay)]/20 focus:border-[var(--color-clay)]",
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
