"use client"

import { createFormHook } from "@tanstack/react-form"

import { fieldContext, formContext } from "./form-context"
import { FormSubmitButton } from "./form-submit-button"
import { FormTextField } from "./form-text-field"

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    TextField: FormTextField,
  },
  formComponents: {
    SubmitButton: FormSubmitButton,
  },
  fieldContext,
  formContext,
})
