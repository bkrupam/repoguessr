"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  size?: "default" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "ghost", size = "lg", className = "", children, disabled, ...props }, ref) => {
    const sizeClass =
      size === "lg"
        ? "action-type min-h-[3.25rem] px-6 py-4"
        : "label px-5 py-3";

    const base =
      `inline-flex items-center justify-center transition-opacity cursor-pointer select-none ${sizeClass}`;

    const styles =
      variant === "primary"
        ? "bg-white text-black rounded-lg hover:opacity-90"
        : disabled
        ? "bg-transparent text-[#2A2A2A] border border-[#2A2A2A] rounded-lg cursor-not-allowed"
        : "bg-transparent text-white border border-[#9A9A9A] rounded-lg hover:border-white";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${base} ${styles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
