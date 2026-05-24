"use client";

import * as React from "react";

import { Button } from "@/ui/shadcn/button";

import { useFormContext } from "./form-context";

type FormSubmitButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "type" | "disabled"
> & {
  disabled?: boolean;
};

export const FormSubmitButton = ({
  children,
  disabled,
  ...buttonProps
}: FormSubmitButtonProps) => {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting] as const}
    >
      {([canSubmit, isSubmitting]) => (
        <Button
          {...buttonProps}
          type="submit"
          disabled={disabled || !canSubmit || isSubmitting}
        >
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
};
