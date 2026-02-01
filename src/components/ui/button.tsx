import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-clay)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
    {
        variants: {
            variant: {
                default:
                    "bg-[var(--color-clay)] text-white hover:bg-[var(--color-clay)]/95 shadow-md hover:shadow-lg active:scale-[0.98]",
                secondary:
                    "bg-[var(--color-olive)] text-white hover:bg-[var(--color-olive)]/95 hover:shadow-md active:scale-[0.98]",
                outline:
                    "border-2 border-[var(--color-border)] bg-transparent hover:border-[var(--color-clay)] hover:text-[var(--color-clay)] active:scale-[0.98]",
                ghost:
                    "hover:bg-[var(--color-limestone)] hover:text-[var(--color-graphite)] active:scale-[0.98]",
                link:
                    "text-[var(--color-clay)] underline-offset-4 hover:underline",
                white:
                    "bg-white text-[var(--color-graphite)] border border-transparent hover:border-[var(--color-border)] shadow-sm hover:shadow-md active:scale-[0.98]",
            },
            size: {
                default: "h-11 px-6 py-2",
                sm: "h-9 px-4 text-xs",
                lg: "h-14 px-8 text-base",
                xl: "h-16 px-10 text-lg",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
