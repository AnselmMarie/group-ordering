import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { z } from "zod";

import { useAppForm } from "./use-app-form";

function TestForm({
  onSubmit,
}: {
  onSubmit?: (value: { name: string }) => void;
}) {
  const form = useAppForm({
    defaultValues: { name: "" },
    validators: {
      onChange: z.object({ name: z.string().min(1, "Required") }),
    },
    onSubmit: async ({ value }) => {
      onSubmit?.(value);
    },
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
    </form>
  );
}

describe("FormTextField", () => {
  it("renders the label", () => {
    render(<TestForm />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("updates the field value on typing", async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const input = screen.getByLabelText("Name") as HTMLInputElement;
    await user.type(input, "Alice");
    expect(input.value).toBe("Alice");
  });

  it("shows a validation error after invalid input", async () => {
    const user = userEvent.setup();
    render(<TestForm />);
    const input = screen.getByLabelText("Name");
    await user.type(input, "x");
    await user.clear(input);
    expect(await screen.findByText("Required")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("does not call onSubmit when invalid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TestForm
        onSubmit={(value) => {
          onSubmit(value);
        }}
      />,
    );
    const form = screen.getByLabelText("Name").closest("form")!;
    form.requestSubmit();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSubmit).not.toHaveBeenCalled();
    void user;
  });
});
