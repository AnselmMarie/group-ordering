import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { SheetDialog } from "./sheet-dialog";

describe("SheetDialog", () => {
  it("does not render title, description, or children when closed", () => {
    render(
      <SheetDialog title="My title" description="My description" isOpen={false}>
        <p>child content</p>
      </SheetDialog>,
    );

    expect(screen.queryByText("My title")).not.toBeInTheDocument();
    expect(screen.queryByText("My description")).not.toBeInTheDocument();
    expect(screen.queryByText("child content")).not.toBeInTheDocument();
  });

  it("renders title, description, and children when open", async () => {
    render(
      <SheetDialog title="My title" description="My description" isOpen={true}>
        <p>child content</p>
      </SheetDialog>,
    );

    expect(await screen.findByText("My title")).toBeInTheDocument();
    expect(await screen.findByText("My description")).toBeInTheDocument();
    expect(await screen.findByText("child content")).toBeInTheDocument();
  });

  it("calls onOpenChange when Escape is pressed", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <SheetDialog
        title="Title"
        description="Description"
        isOpen={true}
        onOpenChange={onOpenChange}
      >
        <p>child</p>
      </SheetDialog>,
    );

    await screen.findByText("Title");
    await user.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: "escape-key" }),
    );
  });
});
