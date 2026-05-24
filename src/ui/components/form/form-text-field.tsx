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
};

export const FormTextField = ({
  label,
  id,
  className,
  ...inputProps
}: FormTextFieldProps) => {
  const field = useFieldContext<string>();
  const errors = field.state.meta.errors;
  const hasError = errors.length > 0;
  const inputId = id ?? field.name;
  const errorId = `${inputId}-error`;

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
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
      />
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
