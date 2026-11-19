import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-[13px] font-semibold whitespace-nowrap transition-all outline-none select-none cursor-pointer focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#147D72] text-white hover:bg-[#0E5F58] shadow-xs",
        outline:
          "border-[#E7EAEE] bg-white text-[#20252D] hover:bg-[#F4F6F9] hover:text-[#20252D]",
        secondary:
          "bg-[#F8FAFB] text-[#20252D] hover:bg-[#F0F2F5]",
        ghost:
          "hover:bg-[#F4F6F9] hover:text-[#20252D]",
        destructive:
          "bg-[#FCECEC] text-[#C74747] hover:bg-[#C74747]/20",
        link: "text-[#147D72] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs: "h-7 gap-1.5 rounded-lg px-2.5 text-xs",
        sm: "h-9 gap-1.5 rounded-xl px-3.5 text-xs",
        lg: "h-11 gap-2 px-5 text-sm",
        icon: "size-9",
        "icon-xs": "size-7 rounded-lg",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-10",
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
  ({ className, variant, size, style, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isIcon = size && String(size).startsWith("icon")
    const defaultPadding = isIcon
      ? undefined
      : size === "xs"
      ? "0 10px"
      : size === "sm"
      ? "0 14px"
      : size === "lg"
      ? "0 20px"
      : "0 16px"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={{
          padding: defaultPadding,
          gap: isIcon ? undefined : "8px",
          ...style,
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
