import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-105 hover:shadow-lg",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-red-600 to-red-700 text-amber-50 border border-red-600/40 hover:from-red-700 hover:to-red-800 hover:border-red-500 hover:shadow-red-600/20",
        destructive:
          "bg-gradient-to-br from-red-600 to-red-700 text-amber-50 border border-red-600/40 hover:from-red-700 hover:to-red-800 hover:shadow-red-600/20",
        outline:
          "border border-stone-700/50 bg-stone-800/50 text-stone-300 hover:text-amber-50 hover:bg-stone-800 hover:border-red-600/50 backdrop-blur-sm hover:shadow-red-600/10",
        secondary:
          "bg-gradient-to-br from-stone-700 to-stone-800 text-amber-50 border border-stone-600/50 hover:from-stone-600 hover:to-stone-700 hover:border-stone-500 hover:shadow-stone-600/20",
        ghost: "hover:bg-stone-800/70 hover:text-amber-50 border border-transparent hover:border-red-600/30",
        link: "text-red-400 underline-offset-4 hover:underline hover:text-red-300",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
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