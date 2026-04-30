import * as React from "react"
import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
<<<<<<< HEAD
                    "flex min-h-[120px] w-full rounded-lg border border-[var(--color-border)] bg-(--color-surface) px-4 py-3 text-base text-(--color-graphite) transition-all duration-200 resize-none",
=======
                    "flex min-h-[120px] w-full rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-base transition-all duration-200 resize-none",
>>>>>>> eb5334bcb12450ce0c614a2fd036de97997fa69e
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
Textarea.displayName = "Textarea"

export { Textarea }
