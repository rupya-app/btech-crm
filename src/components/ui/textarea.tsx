import * as React from "react"
import { cn } from "cn"

function Textarea({ className, style, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[96px] w-full rounded-xl border border-[#E7EAEE] bg-white px-3.5 py-3 text-[13.5px] text-[#20252D] transition-colors outline-none placeholder:text-[#969EAA] focus-visible:border-[#147D72] focus-visible:ring-3 focus-visible:ring-[#147D72]/15 disabled:cursor-not-allowed disabled:bg-[#F4F6F9] disabled:opacity-60",
        className
      )}
      style={{
        padding: "12px 14px",
        minHeight: "96px",
        backgroundColor: props.disabled ? "#F4F6F9" : "#FFFFFF",
        border: "1px solid #E7EAEE",
        borderRadius: "12px",
        ...style,
      }}
      {...props}
    />
  )
}

export { Textarea }
