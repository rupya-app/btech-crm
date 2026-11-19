import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-[#E7EAEE] bg-white px-3.5 py-2 text-[13.5px] text-[#20252D] transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#969EAA] focus-visible:border-[#147D72] focus-visible:ring-3 focus-visible:ring-[#147D72]/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#F4F6F9] disabled:opacity-60",
        className
      )}
      style={{
        padding: "8px 14px",
        minHeight: "42px",
        backgroundColor: props.disabled ? "#F4F6F9" : "#FFFFFF",
        border: "1px solid #E7EAEE",
        borderRadius: "12px",
        ...style,
      }}
      {...props}
    />
  )
}

export { Input }
