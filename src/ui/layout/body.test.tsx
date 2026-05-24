import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Body } from "./body";

describe("Body", () => {
  it("renders children", () => {
    render(
      <Body>
        <p>body content</p>
      </Body>,
    );
    expect(screen.getByText("body content")).toBeInTheDocument();
  });

  it("renders a <main> landmark", () => {
    render(
      <Body>
        <span />
      </Body>,
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
