import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#dc2626] to-red-700 text-white shadow-lg shadow-red-900/30 hover:shadow-xl hover:shadow-red-900/40 hover:from-red-700 hover:to-red-800 border border-red-500/20",
        destructive:
          "bg-gradient-to-r from-[#dc2626] to-red-700 text-white shadow-lg shadow-red-900/30 hover:shadow-xl hover:shadow-red-900/40 hover:from-red-700 hover:to-red-800",
        outline:
          "border-2 border-stone-700/50 bg-stone-900/50 backdrop-blur-sm text-stone-200 hover:text-white hover:bg-stone-800/80 hover:border-stone-600 shadow-lg shadow-black/10",
        secondary:
          "bg-gradient-to-br from-stone-800 to-stone-900 text-white border border-stone-700/50 hover:from-stone-700 hover:to-stone-800 hover:border-stone-600 shadow-lg shadow-black/20",
        ghost: "hover:bg-stone-800/60 hover:text-white transition-colors",
        link: "text-red-400 underline-offset-4 hover:underline hover:text-red-300 hover:scale-100",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-xl px-4 text-xs",
        lg: "h-14 rounded-2xl px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }