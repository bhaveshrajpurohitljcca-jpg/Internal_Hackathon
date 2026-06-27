import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 transition-colors duration-200",
            "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
            "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
            error ? "border-red-500 dark:border-red-500/50" : "border-slate-300 dark:border-slate-700",
            className,
          )}
          {...props}
        />
        {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
        {!error && hint && <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
