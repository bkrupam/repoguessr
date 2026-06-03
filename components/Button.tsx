"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { buttonClassName } from "@/lib/buttonStyles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  size?: "default" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "ghost", size = "lg", className = "", children, disabled, type = "button", ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={buttonClassName(variant, size, className, disabled)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
