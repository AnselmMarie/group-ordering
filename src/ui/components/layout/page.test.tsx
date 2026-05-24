import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Page } from "./page";

describe("Page", () => {
  it("renders children", () => {
    render(
      <Page>
        <p>hello child</p>
      </Page>,
    );
    expect(screen.getByText("hello child")).toBeInTheDocument();
  });

  it("renders a div wrapper around its children", () => {
    const { container } = render(
      <Page>
        <span data-testid="inner" />
      </Page>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("DIV");
    expect(root).toContainElement(screen.getByTestId("inner"));
  });
});
