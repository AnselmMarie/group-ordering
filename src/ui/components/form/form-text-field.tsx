"use client";

import * as React from "react";

import { Input } from "@/ui/shadcn/input";
import { cn } from "@/lib/utils";

import { useFieldContext } from "./form-context";

type FormTextFieldProps = Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "onBlur" | "name" | "defaultValue"
> & {
  label?: string;
  helperText?: string;
};

export const FormTextField = ({
  label,
  helperText,
  id,
  className,
  ...inputProps
}: FormTextFieldProps) => {
  const field = useFieldContext<string>();
  const errors = field.state.meta.errors;
  const hasError = errors.length > 0;
  const inputId = id ?? field.name;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const describedBy =
    [hasError ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
      )}
      <Input
        {...inputProps}
        id={inputId}
        name={field.name}
        value={field.state.value ?? ""}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
      />
      {helperText && (
        <p id={helperId} className="text-xs text-zinc-500 dark:text-zinc-400">
          {helperText}
        </p>
      )}
      {hasError && (
        <p id={errorId} className="text-xs text-destructive">
          {errors
            .map((error) =>
              typeof error === "string" ? error : (error?.message ?? ""),
            )
            .filter(Boolean)
            .join(", ")}
        </p>
      )}
    </div>
  );
};
