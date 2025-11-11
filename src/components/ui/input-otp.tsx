import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";

import { cn } from "@/lib/utils";

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-90",
      containerClassName,
    )}
    className={cn("enabled:cursor-allowed", className)}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 ", className)}
    {...props}
  />
));
InputOTPGroup.displayName = "InputOTPGroup";

interface InputOTPSlotProps extends React.ComponentPropsWithoutRef<"div"> {
  index?: number;
}

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"input">,
  InputOTPSlotProps
>(({ className, index = 0, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const slot = inputOTPContext?.slots?.[index];

  if (!slot) {
    return (
      <div
        contentEditable="true"
        ref={ref}
        className={cn(
          "relative h-10 w-10 rounded-md border border-input bg-transparent text-red-500 text-center text-sm shadow-sm transition-all",
          "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          className,
        )}
        style={{
          caretColor: "white", // Ensure caret is visible
          color: "white", // Ensure text color is visible
        }}
        {...props}
      >
        {props.defaultValue}
        {/* jdbfjbfjfbnfjfjkfrkjr */}
      </div>
    );
  }
  const { char, hasFakeCaret, isActive } = slot;
  return (
    <input
      //ref={ref}
      className={cn(
        "relative h-10 w-10 rounded-md border border-input bg-white text-center text-lg font-medium shadow-sm transition-all",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-background",
        isActive && "ring-2 ring-ring ring-offset-background",
        className,
      )}
      {...props}
    >
      {/* Render the character, default to a placeholder if empty */}
      {char || <span className="text-gray-40">_</span>}

      {/* Optional blinking caret */}
      {hasFakeCaret && (
        <input className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <input className="h-4 w-px animate-caret-blink text-red-500 bg-foreground duration-1000" />
        </input>
      )}
    </input>
  );
});

InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
