import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { z } from "zod";

import { useAppForm } from "./use-app-form";

function TestForm() {
  const form = useAppForm({
    defaultValues: { name: "" },
    validators: {
      onChange: z.object({ name: z.string().min(1, "Required") }),
    },
    onSubmit: async () => {},
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="name">
        {(field) => <field.TextField label="Name" />}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton>Save</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}

describe("FormSubmitButton", () => {
  it("is disabled while the form is invalid", async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const button = screen.getByRole("button", { name: "Save" });
    const input = screen.getByLabelText("Name");
    await user.type(input, "a");
    await user.clear(input);
    expect(button).toBeDisabled();
  });

  it("is enabled when the form is valid", async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const input = screen.getByLabelText("Name");
    await user.type(input, "Alice");
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).not.toBeDisabled();
  });

  it("renders its children as the label", () => {
    render(<TestForm />);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});
